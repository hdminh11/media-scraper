'use strict';

const { ReasonPhrases, StatusCodes } = require("../utils/httpStatusCode");


class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.BAD_REQUEST, status = StatusCodes.BAD_REQUEST) {
        super(message, status);
    };
}

module.exports = {
    BadRequestError,
}