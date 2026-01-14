'use strict';

const { SuccessResponse } = require("../core/success.response");
const mediaService = require("../services/media.service");

class MediaController {
    ingest = async (req, res, next) => {
        const urls = req.body.urls;
        new SuccessResponse({
            metadata: await mediaService.ingest({ urls })
        }).send(res);
    };
}

module.exports = new MediaController();