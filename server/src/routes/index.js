'use strict';

const express = require('express');
const router = express.Router();

router.use('/media', require('./media'));

module.exports = router;