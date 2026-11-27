
const { ObjectId } = require('mongodb')
const MongodbService = require(`${global.__basedir}/src/services/mongodb-service`)

function createMongodbService() {
  return new MongodbService({
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_WEB_DB || process.env.MONGODB_DB
  })
}

function normalizeWord(word) {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function getTitle(messages = []) {
  const firstMessage = messages.find(message => message.userQuery)

  if (!firstMessage) return 'Nueva conversación'

  const ignoredWords = new Set([
    'a', 'al', 'algo', 'algunos', 'algunas',
    'como', 'con', 'cual', 'cuales',
    'de', 'del', 'desde',
    'dime', 'dime', 'donde',
    'el', 'ella', 'ellas', 'ellos', 'en', 'entre', 'es', 'esa', 'ese', 'eso', 'esta', 'este', 'esto',
    'favor', 'hay',
    'la', 'las', 'le', 'les', 'lo', 'los',
    'me', 'mi', 'mis', 'mucho', 'muchos',
    'necesito',
    'para', 'pero', 'por', 'puedes', 'podrias',
    'que', 'quiero', 'quisiera',
    'se', 'si', 'sobre', 'su', 'sus',
    'te', 'tengo', 'tu', 'tus',
    'un', 'una', 'unas', 'unos',
    'y', 'ya',
    'busca', 'buscar', 'buscame',
    'explica', 'explicame',
    'dame', 'hazme', 'muestrame'
  ])

  const words = firstMessage.userQuery.match(/[\p{L}\p{N}]+/gu) || []

  const relevantWords = words
    .filter(word => !ignoredWords.has(normalizeWord(word)))
    .slice(0, 6)

  const titleWords = relevantWords.length
    ? relevantWords
    : words.slice(0, 6)

  if (!titleWords.length) return 'Nueva conversación'

  return titleWords
    .map(word => word.toLocaleLowerCase('es'))
    .join(' ')
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

exports.create = async (req, res, next) => {
  const mongodbService = createMongodbService()

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
      messages: []
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
  const mongodbService = createMongodbService()

  try {
    const conversations = await mongodbService.getCollection('conversations')

    const result = conversations
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0)
        const dateB = new Date(b.updatedAt || b.createdAt || 0)

        return dateB - dateA
      })
      .map(conversation => ({
        conversationId: conversation._id.toString(),
        title: getTitle(conversation.messages),
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
  const mongodbService = createMongodbService()

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

    const messages = (conversation.messages || []).map(parseMessage)

    res.status(200).send({
      conversationId: conversation._id.toString(),
      title: getTitle(conversation.messages),
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
