
const fs = require('fs/promises')
const path = require('path')
const MongodbService = require(`${global.__basedir}/src/services/mongodb-service`)
const VectorService = require(`${global.__basedir}/src/services/vector-service`)
const OpenAIService = require(`${global.__basedir}/src/services/openai-service`)
const generateConversationSummary = require(`${global.__basedir}/src/services/conversation-summary-service`)
const { answerGenerationSchema } = require(`${global.__basedir}/src/ia/schemas`)
const { answerGenerationWithPdfsInstructions } = require(`${global.__basedir}/src/ia/instructions`)

exports.create = async (req, res, next) => {
  try {
    const userQuery = req.body.userQuery
    const responseId = req.body.responseId || null
    const conversationId = req.body.conversationId || null

    if (typeof userQuery !== 'string' || !userQuery.trim()) {
      res.status(400).send({
        message: 'El mensaje no puede estar vacío.'
      })
      return
    }

    const vectorService = new VectorService({
      clientOptions: {
        host: process.env.CHROMA_HOST || '127.0.0.1',
        port: Number(process.env.CHROMA_PORT || 8000),
        ssl: process.env.CHROMA_SSL === 'true'
      }
    })

    await vectorService.getCollection('publications')

    const result = await vectorService.query({
      queryTexts: [userQuery],
      nResults: 10
    })

    const candidatesByPath = new Map()

    for (const [queryIndex, metadatas] of (result.metadatas ?? []).entries()) {
      for (const [matchIndex, metadata] of (metadatas ?? []).entries()) {
        if (!metadata?.filepath) continue

        const filepath = path.resolve(metadata.filepath)

        if (path.extname(filepath).toLowerCase() !== '.pdf') continue

        if (!candidatesByPath.has(filepath)) {
          candidatesByPath.set(filepath, {
            id: `PDF${candidatesByPath.size + 1}`,
            filepath,
            filename: path.basename(filepath),
            matches: []
          })
        }

        candidatesByPath.get(filepath).matches.push({
          id: result.ids?.[queryIndex]?.[matchIndex] ?? null,
          page: metadata.page ?? null,
          keywords: result.documents?.[queryIndex]?.[matchIndex] ?? null,
          distance: result.distances?.[queryIndex]?.[matchIndex] ?? null
        })
      }
    }

    const candidates = [...candidatesByPath.values()]
    let data
    let currentResponseId = responseId

    if (!candidates.length) {
      data = {
        answer: 'No he encontrado documentos que contengan información para responder a tu pregunta.',
        status: 'insufficient_information',
        sources: []
      }
    } else {
      const stats = await Promise.all(
        candidates.map(candidate => fs.stat(candidate.filepath))
      )

      const maxBytes = 50_000_000
      const totalBytes = stats.reduce((sum, stat) => sum + stat.size, 0)

      if (
        stats.some(stat => stat.size >= maxBytes) ||
        totalBytes >= maxBytes
      ) {
        throw new Error(
          'Los PDF candidatos superan el límite de archivos de una petición. ' +
          'Es necesario procesarlos en grupos.'
        )
      }

      const attachments = await Promise.all(
        candidates.map(async candidate => {
          const buffer = await fs.readFile(candidate.filepath)

          return {
            type: 'input_file',
            filename: `${candidate.id}-${candidate.filename}`,
            file_data: `data:application/pdf;base64,${buffer.toString('base64')}`
          }
        })
      )

      const input = [{
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify({
              question: userQuery,
              candidates: candidates.map(candidate => ({
                id: candidate.id,
                filename: candidate.filename,
                attachment: `${candidate.id}-${candidate.filename}`,
                matches: candidate.matches
              }))
            })
          },
          ...attachments
        ]
      }]

      const openAIService = new OpenAIService()

      if (responseId) {
        openAIService.setResponseId(responseId)
      }

      const response = await openAIService.createResponse({
        input,
        model: 'gpt-6-luna',
        options: {
          reasoning: {
            effort: 'low'
          },
          store: true,
          instructions: `${answerGenerationWithPdfsInstructions}

Additionally, generate a conversation summary:
- Between 3 and 5 words.
- In the same language as the user's question.
- Describe the main topic or intent of the question.
- Do not summarize your answer.

Include the summary field required by the JSON schema.`,
          prompt_cache_key: 'answer-generation-v1',
          text: {
            format: {
              type: 'json_schema',
              name: 'answer-generation',
              strict: true,
              schema: answerGenerationSchema
            }
          }
        }
      })

      data = JSON.parse(response.output_text)
      currentResponseId = response.id
    }

    const { summary, ...messageData } = data

    const currentConversationId = await saveConversationMessage(
      conversationId,
      summary,
      {
        userQuery,
        ...messageData,
        responseId: currentResponseId,
        createdAt: new Date()
      }
    )

    res.status(200).send({
      ...messageData,
      ...(summary && { summary }),
      ...(currentResponseId && { responseId: currentResponseId }),
      conversationId: currentConversationId
    })
  } catch (error) {
    next(error)
  }
}

async function saveConversationMessage(conversationId, summary, message) {
  const mongodbService = new MongodbService({
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_WEB_DB || process.env.MONGODB_DB
  })

  try {
    const now = new Date()

    if (conversationId) {
      const mongoConversationId = mongodbService.createId(conversationId)

      const conversation = await mongodbService.getFirst(
        'conversations',
        { _id: mongoConversationId }
      )

      if (!conversation) {
        throw new Error('No se ha encontrado la conversación en MongoDB.')
      }

      const updateResult = await mongodbService.updateOne(
        'conversations',
        { _id: mongoConversationId },
        {
          $push: {
            messages: message
          },
          $set: {
            updatedAt: now
          }
        }
      )

      if (!updateResult.matchedCount) {
        throw new Error('No se ha encontrado la conversación en MongoDB.')
      }

      if (!conversation.summary?.trim()) {
        try {
          const generatedSummary = await generateConversationSummary([
            ...(conversation.messages || []),
            message
          ])

          await mongodbService.updateOne(
            'conversations',
            {
              _id: mongoConversationId,
              $or: [
                { summary: { $exists: false } },
                { summary: null },
                { summary: '' }
              ]
            },
            {
              $set: {
                summary: generatedSummary
              }
            }
          )
        } catch (error) {
          console.warn('No se pudo generar el título de la conversación:', error.message)
        }
      }

      return mongoConversationId.toString()
    }

    let conversationSummary = summary

    if (!conversationSummary) {
      try {
        conversationSummary = await generateConversationSummary([message])
      } catch (error) {
        console.warn('No se pudo generar el título de la conversación:', error.message)
      }
    }

    const conversation = await mongodbService.insertOne(
      'conversations',
      {
        ...(conversationSummary && { summary: conversationSummary }),
        messages: [message],
        createdAt: now,
        updatedAt: now
      }
    )

    return conversation.insertedId.toString()
  } finally {
    await mongodbService.close().catch(error => {
      console.warn('No se pudo cerrar MongoDB:', error.message)
    })
  }
}
