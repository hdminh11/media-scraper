'use strict';

const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode");

class SuccessResponse {
    constructor({ message, statusCode = StatusCodes.OK, reasonStatusCode = ReasonPhrases.OK, metadata = {}, options = {} }) {
        this.message = !message ? reasonStatusCode : message;
        this.status = statusCode;
        this.metadata = metadata;
        this.options = options;
    }

    send(res, headers = {}) {
        return res.status(this.status).json(this);
    }
}

module.exports = {
    SuccessResponse,
}