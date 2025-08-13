"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APPLICATION_ERROR = exports.WalletNotFoundError = exports.UnsupportedChainError = exports.ChainNotFoundError = exports.TransactionNotConfirmedError = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message, cause, isOperational = true, stack = "") {
        super(message);
        this._type = this.constructor.name;
        this._errors = [];
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.cause =
            cause instanceof Error
                ? cause
                : cause
                    ? new Error(String(cause))
                    : undefined;
        this.stack = stack || Error.captureStackTrace(this, this.constructor) || "";
    }
    get type() {
        return this._type;
    }
    get errors() {
        return this._errors;
    }
    get stackTrace() {
        let stackTrace = `${this._type} stack trace: ${this.stack ?? "No stack available"}\n`;
        if (this.cause) {
            const causeMessage = this.cause instanceof Error ? this.cause.stack : this.cause;
            stackTrace += `Caused by: ${causeMessage}`;
        }
        return stackTrace;
    }
    addError(error) {
        if (error instanceof Error || typeof error === "string") {
            this._errors.push(error);
        }
        else {
            throw new TypeError("Invalid error type. Must be an Error object or string.");
        }
        return this;
    }
    toObject() {
        return {
            type: this._type,
            status: this.statusCode,
            message: this.message,
            errors: this._errors.map((error) => error instanceof Error ? error.message : error),
            cause: this.cause instanceof Error ? this.cause.message : this.cause,
        };
    }
    static fromError(error, statusCode = 500) {
        return new ApiError(statusCode, error.message, error);
    }
    static fromMessage(message, statusCode = 400) {
        return new ApiError(statusCode, message);
    }
}
exports.ApiError = ApiError;
class TransactionNotConfirmedError extends ApiError {
    // base constructor only accepts string message as an argument
    // we extend it here to accept an object, allowing us to pass other data
    constructor(data) {
        super(500, `Transaction not confirmed: ${JSON.stringify(data)}`, exports.APPLICATION_ERROR.TRANSACTION_NOT_CONFIRMED_ERROR, true);
        this.id = exports.APPLICATION_ERROR.TRANSACTION_NOT_CONFIRMED_ERROR;
        this.message = "Transaction not confirmed";
        this.name = `TransactionNotConfirmedError`;
        this.statusCode = 500;
        this.isOperational = true;
        this.data = data; // this property is defined in parent
    }
}
exports.TransactionNotConfirmedError = TransactionNotConfirmedError;
class ChainNotFoundError extends ApiError {
    constructor(message = "Chain not found", statusCode, cause, isOperational = true) {
        super(statusCode, message, cause, isOperational);
        statusCode = statusCode;
        this.name = `ChainNotFoundError`;
    }
}
exports.ChainNotFoundError = ChainNotFoundError;
class UnsupportedChainError extends ApiError {
    constructor(message = "Unsupported chain", statusCode, cause, isOperational = true) {
        super(statusCode, message, cause, isOperational);
        statusCode = statusCode;
        this.name = `UnsupportedChainError`;
    }
}
exports.UnsupportedChainError = UnsupportedChainError;
class WalletNotFoundError extends ApiError {
    constructor(message = "Wallet not found in db", statusCode, cause, isOperational = true) {
        super(statusCode, message, cause, isOperational);
        statusCode = statusCode;
        this.name = `WalletNotFoundError`;
    }
}
exports.WalletNotFoundError = WalletNotFoundError;
exports.APPLICATION_ERROR = {
    JUPITER_SWAP_ERROR: "quote_swap_error",
    TRANSACTION_NOT_CONFIRMED_ERROR: "transaction_not_confirmed",
};
