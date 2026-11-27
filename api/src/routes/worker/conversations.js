
const express = require('express')
const router = express.Router()
const controller = require('../../controllers/worker/conversation-controller.js')

router.get('/', controller.findAll)
router.post('/', controller.create)
router.get('/:id', controller.findById)

module.exports = router
