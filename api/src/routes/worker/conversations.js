
const express = require('express')
const router = express.Router()
const controller = require('../../controllers/worker/conversation-controller.js')

router.post('/', controller.create)
router.get('/', controller.findAll)
router.get('/:id', controller.findById)

module.exports = router
