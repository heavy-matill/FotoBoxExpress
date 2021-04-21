// Initialize express router
var router = require('express').Router()

// Import Foto controller
var fotoController = require('../controllers/fotoController')
// Foto routes
router.route('/')
    .get(fotoController.index)
    .post(fotoController.new)
router.route('/:name')
    .get(fotoController.view)
    .patch(fotoController.update)
    .put(fotoController.update)
    .delete(fotoController.delete)
// Export API routes
module.exports = router