"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadGatewayException = exports.InternalServerErrorException = exports.TooManyRequestsException = exports.UnprocessableEntityException = exports.ConflictException = exports.NotFoundException = exports.UnauthorizedException = exports.BadRequestException = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const errors_enum_1 = require("./errors.enum");
class BadRequestException {
    constructor(message = errors_enum_1.HTTPMessages.BAD_REQUEST) {
        throw (0, http_errors_1.default)(errors_enum_1.HTTPStatusCode.BadRequest, message);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException {
    constructor(message = errors_enum_1.HTTPMessages.UNAUTHORIZED) {
        throw (0, http_errors_1.default)(errors_enum_1.HTTPStatusCode.Unauthorized, message);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class NotFoundException {
    constructor(message = errors_enum_1.HTTPMessages.NOT_FOUND) {
        throw (0, http_errors_1.default)(errors_enum_1.HTTPStatusCode.NotFound, message);
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException {
    constructor(message = errors_enum_1.HTTPMessages.CONFLICT) {
        throw (0, http_errors_1.default)(errors_enum_1.HTTPStatusCode.Conflict, message);
    }
}
exports.ConflictException = ConflictException;
class UnprocessableEntityException {
    constructor(message = errors_enum_1.HTTPMessages.UNPROCESSABLE_ENTITY) {
        throw (0, http_errors_1.default)(errors_enum_1.HTTPStatusCode.UnprocessableEntity, message);
    }
}
exports.UnprocessableEntityException = UnprocessableEntityException;
class TooManyRequestsException {
    constructor(message = errors_enum_1.HTTPMessages.TOO_MANY_REQUESTS) {
        throw (0, http_errors_1.default)(errors_enum_1.HTTPStatusCode.TooManyRequests, message);
    }
}
exports.TooManyRequestsException = TooManyRequestsException;
class InternalServerErrorException {
    constructor(message = errors_enum_1.HTTPMessages.INTERNAL_SERVER_ERROR) {
        throw (0, http_errors_1.default)(errors_enum_1.HTTPStatusCode.InternalServerError, message);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
class BadGatewayException {
    constructor(message = errors_enum_1.HTTPMessages.BAD_GATEWAY) {
        throw (0, http_errors_1.default)(errors_enum_1.HTTPStatusCode.BadGateway, message);
    }
}
exports.BadGatewayException = BadGatewayException;
