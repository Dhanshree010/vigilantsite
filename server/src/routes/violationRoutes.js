const express = require('express');
const router = express.Router();
const violationController = require('../controllers/violationController');

// Webhook endpoint called by edge Python worker (or simulator)
router.post('/', violationController.createViolation);

// Queries for UI dashboard
router.get('/', violationController.getViolations);
router.get('/stats', violationController.getStats);
router.get('/export', violationController.exportAuditLog);
router.patch('/:id', violationController.updateViolationStatus);

module.exports = router;
