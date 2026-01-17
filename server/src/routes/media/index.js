'use strict';

const express = require('express');
const mediaController = require('../../controllers/media.controller');
const { asyncHandler } = require('../../helpers/async.handler');
const router = express.Router();

router.post('/ingest', asyncHandler(mediaController.ingest));

router.get('/getAll', asyncHandler(mediaController.getAllMedia));

module.exports = router;