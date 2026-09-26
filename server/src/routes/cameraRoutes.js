const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');

router.get('/', cameraController.getCameras);
router.post('/:id/ping', cameraController.pingCamera);

module.exports = router;
