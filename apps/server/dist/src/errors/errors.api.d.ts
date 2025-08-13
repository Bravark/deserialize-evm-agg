export declare class ApiError extends Error {
    private readonly _type;
    statusCode: number;
    isOperational: boolean;
    cause?: Error;
    private _errors;
    constructor(statusCode: number, message: string | undefined, cause?: Error | string, isOperational?: boolean, stack?: string);
    get type(): string;
    get errors(): Array<Error | string>;
    get stackTrace(): string;
    addError(error: Error | string): this;
    toObject(): {
        type: string;
        status: number;
        message: string;
        errors: string[];
        cause: string | undefined;
    };
    static fromError(error: Error, statusCode?: number): ApiError;
    static fromMessage(message: string, statusCode?: number): ApiError;
}
export declare class TransactionNotConfirmedError extends ApiError {
    readonly id: string;
    data: {
        [key: string]: string;
    } | undefined;
    message: string;
    name: string;
    statusCode: number;
    isOperational: boolean;
    constructor(data: {
        [key: string]: string;
    });
}
export declare class ChainNotFoundError extends ApiError {
    constructor(message: string | undefined, statusCode: number, cause?: Error | string, isOperational?: boolean);
}
export declare class UnsupportedChainError extends ApiError {
    constructor(message: string | undefined, statusCode: number, cause?: Error | string, isOperational?: boolean);
}
export declare class WalletNotFoundError extends ApiError {
    constructor(message: string | undefined, statusCode: number, cause?: Error | string, isOperational?: boolean);
}
export declare const APPLICATION_ERROR: {
    JUPITER_SWAP_ERROR: string;
    TRANSACTION_NOT_CONFIRMED_ERROR: string;
};
