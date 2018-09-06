const express = require('express');
const router = express.Router();

// ---- private ----
router.use('/private', require('./controller/_private'));

// ---- api ----
router.use('/sign', require('./controller/sign'));
router.use('/file', require('./controller/file'));
router.use('/image', require('./controller/image'));
router.use('/data', require('./controller/data'));

module.exports = router;