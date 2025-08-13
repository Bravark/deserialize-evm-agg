export declare enum HTTPStatusCode {
    Ok = 200,
    Created = 201,
    Accepted = 202,
    NoContent = 204,
    PartialContent = 206,
    MultipleChoices = 300,
    MovedPermanently = 301,
    Found = 302,
    BadRequest = 400,
    Unauthorized = 401,
    PaymentRequired = 402,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    RequestTimeout = 408,
    Conflict = 409,
    Gone = 410,
    UnprocessableEntity = 422,
    TooManyRequests = 429,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504
}
export declare const DEX_ERRORS: {
    PAIR_NOT_AVAILABLE_ON_DEX: string;
};
export declare class HTTPMessages {
    static readonly OK: string;
    static readonly CREATED: string;
    static readonly BAD_REQUEST: string;
    static readonly UNAUTHORIZED: string;
    static readonly NOT_FOUND: string;
    static readonly CONFLICT: string;
    static readonly UNPROCESSABLE_ENTITY: string;
    static readonly TOO_MANY_REQUESTS: string;
    static readonly INTERNAL_SERVER_ERROR: string;
    static readonly BAD_GATEWAY: string;
}
