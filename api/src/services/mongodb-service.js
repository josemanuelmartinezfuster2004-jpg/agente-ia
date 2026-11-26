const { MongoClient, ObjectId } = require('mongodb')

module.exports = class MongodbService {
  constructor ({ uri, dbName }) {
    if (!uri) {
      throw new Error('MONGODB_URI no está configurada')
    }

    if (!dbName) {
      throw new Error('MONGODB_WEB_DB no está configurada')
    }

    this.uri = uri
    this.dbName = dbName
    this.client = new MongoClient(uri)
    this.db = null
    this.connectPromise = null
  }

  async connect () {
    if (!this.connectPromise) {
      this.connectPromise = this.client.connect()
        .then(() => {
          this.db = this.client.db(this.dbName)
          return this.db
        })
        .catch(error => {
          this.connectPromise = null
          throw error
        })
    }

    return this.connectPromise
  }

  createId (id) {
    return id ? new ObjectId(id) : new ObjectId()
  }

  async changeDb (dbName) {
    if (!dbName) {
      throw new Error('El nombre de la base de datos es obligatorio')
    }

    await this.connect()
    this.dbName = dbName
    this.db = this.client.db(dbName)
  }

  async getCollection (collection, whereStatement = {}) {
    await this.connect()
    return this.db.collection(collection).find(whereStatement).toArray()
  }

  async getFirst (collection, whereStatement = {}) {
    await this.connect()
    return this.db.collection(collection).findOne(whereStatement)
  }

  async insertMany (collection, docs = []) {
    await this.connect()
    return this.db.collection(collection).insertMany(docs)
  }

  async insertOne (collection, doc = {}) {
    await this.connect()
    return this.db.collection(collection).insertOne(doc)
  }

  async updateOne (collection, whereStatement = {}, update = {}) {
    await this.connect()
    return this.db.collection(collection).updateOne(whereStatement, update)
  }

  async updateMany (collection, whereStatement = {}, update = {}) {
    await this.connect()
    return this.db.collection(collection).updateMany(whereStatement, update)
  }

  async close () {
    if (this.connectPromise) {
      await this.client.close()
    }

    this.connectPromise = null
    this.db = null
  }
}
