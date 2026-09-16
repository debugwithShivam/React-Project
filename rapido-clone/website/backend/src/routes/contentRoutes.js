const express = require('express');
const contentController = require('../controllers/contentController');

const router = express.Router();

router.get('/', contentController.getContent);
router.put('/', contentController.updateContent);

module.exports = router;
