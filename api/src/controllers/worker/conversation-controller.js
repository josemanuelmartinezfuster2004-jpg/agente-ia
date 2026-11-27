
const { ObjectId } = require('mongodb')
const MongodbService = require(`${global.__basedir}/src/services/mongodb-service`)
const generateConversationSummary = require(`${global.__basedir}/src/services/conversation-summary-service`)

exports.create = async (req, res, next) => {
  const mongodbService = new MongodbService({
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_WEB_DB || process.env.MONGODB_DB
  })

  try {
    const now = new Date()

    const conversation = await mongodbService.insertOne(
      'conversations',
      {
        messages: [],
        createdAt: now,
        updatedAt: now
      }
    )

    res.status(201).send({
      conversationId: conversation.insertedId.toString(),
      title: 'Nueva conversación',
      messageCount: 0,
      createdAt: now,
      updatedAt: now
    })
  } catch (error) {
    next(error)
  } finally {
    await mongodbService.close().catch(error => {
      console.warn('No se pudo cerrar MongoDB:', error.message)
    })
  }
}

exports.findAll = async (req, res, next) => {
  const mongodbService = new MongodbService({
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_WEB_DB || process.env.MONGODB_DB
  })

  try {
    const conversations = await mongodbService.getCollection('conversations')

    conversations.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0)
      const dateB = new Date(b.updatedAt || b.createdAt || 0)

      return dateB - dateA
    })

    for (const conversation of conversations) {
      await ensureConversationSummary(mongodbService, conversation)
    }

    const result = conversations.map(conversation => ({
      conversationId: conversation._id.toString(),
      title: conversation.summary || 'Nueva conversación',
      messageCount: conversation.messages?.length || 0,
      createdAt: conversation.createdAt || null,
      updatedAt: conversation.updatedAt || conversation.createdAt || null
    }))

    res.status(200).send(result)
  } catch (error) {
    next(error)
  } finally {
    await mongodbService.close().catch(error => {
      console.warn('No se pudo cerrar MongoDB:', error.message)
    })
  }
}

exports.findById = async (req, res, next) => {
  const mongodbService = new MongodbService({
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_WEB_DB || process.env.MONGODB_DB
  })

  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      res.status(400).send({
        message: 'El identificador de conversación no es válido.'
      })
      return
    }

    const conversation = await mongodbService.getFirst(
      'conversations',
      { _id: mongodbService.createId(id) }
    )

    if (!conversation) {
      res.status(404).send({
        message: 'No se ha encontrado la conversación.'
      })
      return
    }

    await ensureConversationSummary(mongodbService, conversation)

    const messages = (conversation.messages || []).map(parseMessage)

    res.status(200).send({
      conversationId: conversation._id.toString(),
      title: conversation.summary || 'Nueva conversación',
      responseId: getLastResponseId(conversation.messages),
      createdAt: conversation.createdAt || null,
      updatedAt: conversation.updatedAt || conversation.createdAt || null,
      messages
    })
  } catch (error) {
    next(error)
  } finally {
    await mongodbService.close().catch(error => {
      console.warn('No se pudo cerrar MongoDB:', error.message)
    })
  }
}

async function ensureConversationSummary(mongodbService, conversation) {
  if (conversation.summary?.trim()) return
  if (!conversation.messages?.length) return

  try {
    const summary = await generateConversationSummary(conversation.messages)

    const updateResult = await mongodbService.updateOne(
      'conversations',
      {
        _id: conversation._id,
        $or: [
          { summary: { $exists: false } },
          { summary: null },
          { summary: '' }
        ]
      },
      {
        $set: {
          summary
        }
      }
    )

    if (updateResult.modifiedCount) {
      conversation.summary = summary
      return
    }

    const updatedConversation = await mongodbService.getFirst(
      'conversations',
      { _id: conversation._id }
    )

    if (updatedConversation?.summary) {
      conversation.summary = updatedConversation.summary
    }
  } catch (error) {
    console.warn(
      `No se pudo generar el título de la conversación ${conversation._id}:`,
      error.message
    )
  }
}

function parseMessage(message) {
  let response = {}

  if (message.output_text) {
    try {
      response = JSON.parse(message.output_text)
    } catch {
      response = {
        answer: message.output_text
      }
    }
  }

  return {
    userQuery: message.userQuery || '',
    answer: message.answer || response.answer || '',
    status: message.status || response.status || null,
    sources: message.sources || response.sources || [],
    responseId: message.responseId || message.id || null,
    createdAt: message.createdAt || null
  }
}

function getLastResponseId(messages = []) {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index]
    const responseId = message.responseId || message.id

    if (responseId) return responseId
  }

  return null
}
