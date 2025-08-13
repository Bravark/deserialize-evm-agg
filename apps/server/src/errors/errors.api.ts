export class ApiError extends Error {
  private readonly _type = this.constructor.name;
  statusCode: number;
  isOperational: boolean;
  cause?: Error;
  private _errors: Array<Error | string> = [];

  constructor(
    statusCode: number,
    message: string | undefined,
    cause?: Error | string,
    isOperational = true,
    stack = ""
  ) {
    super(message);
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

  get type(): string {
    return this._type;
  }

  get errors(): Array<Error | string> {
    return this._errors;
  }

  get stackTrace(): string {
    let stackTrace = `${this._type} stack trace: ${
      this.stack ?? "No stack available"
    }\n`;

    if (this.cause) {
      const causeMessage =
        this.cause instanceof Error ? this.cause.stack : this.cause;
      stackTrace += `Caused by: ${causeMessage}`;
    }

    return stackTrace;
  }

  addError(error: Error | string): this {
    if (error instanceof Error || typeof error === "string") {
      this._errors.push(error);
    } else {
      throw new TypeError(
        "Invalid error type. Must be an Error object or string."
      );
    }
    return this;
  }

  toObject() {
    return {
      type: this._type,
      status: this.statusCode,
      message: this.message,
      errors: this._errors.map((error) =>
        error instanceof Error ? error.message : error
      ),
      cause: this.cause instanceof Error ? this.cause.message : this.cause,
    };
  }

  static fromError(error: Error, statusCode = 500): ApiError {
    return new ApiError(statusCode, error.message, error);
  }

  static fromMessage(message: string, statusCode = 400): ApiError {
    return new ApiError(statusCode, message);
  }
}

export class TransactionNotConfirmedError extends ApiError {
  readonly id: string = APPLICATION_ERROR.TRANSACTION_NOT_CONFIRMED_ERROR;
  data: { [key: string]: string } | undefined;
  message = "Transaction not confirmed";
  name = `TransactionNotConfirmedError`;
  statusCode = 500;
  isOperational = true;

  // base constructor only accepts string message as an argument
  // we extend it here to accept an object, allowing us to pass other data
  constructor(data: { [key: string]: string }) {
    super(
      500,
      `Transaction not confirmed: ${JSON.stringify(data)}`,
      APPLICATION_ERROR.TRANSACTION_NOT_CONFIRMED_ERROR,
      true
    );
    this.data = data; // this property is defined in parent
  }
}

export class ChainNotFoundError extends ApiError {
  constructor(
    message = "Chain not found",
    statusCode: number,
    cause?: Error | string,
    isOperational = true
  ) {
    super(statusCode, message, cause, isOperational);
    statusCode = statusCode;

    this.name = `ChainNotFoundError`;
  }
}

export class UnsupportedChainError extends ApiError {
  constructor(
    message = "Unsupported chain",
    statusCode: number,
    cause?: Error | string,
    isOperational = true
  ) {
    super(statusCode, message, cause, isOperational);
    statusCode = statusCode;
    this.name = `UnsupportedChainError`;
  }
}

export class WalletNotFoundError extends ApiError {
  constructor(
    message = "Wallet not found in db",
    statusCode: number,
    cause?: Error | string,
    isOperational = true
  ) {
    super(statusCode, message, cause, isOperational);
    statusCode = statusCode;
    this.name = `WalletNotFoundError`;
  }
}

export const APPLICATION_ERROR = {
  JUPITER_SWAP_ERROR: "quote_swap_error",
  TRANSACTION_NOT_CONFIRMED_ERROR: "transaction_not_confirmed",
};
