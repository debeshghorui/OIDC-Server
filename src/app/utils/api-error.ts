/**
 * @class ApiError
 * @description A class that represents an API error.
 * @param statusCode - The HTTP status code of the error.
 * @param message - The error message.
 */
class ApiError extends Error {
    /**
     * @property statusCode - The HTTP status code of the error.
     */
    statusCode: number;

    /**
     * @property isOperational - Whether the error is operational.
     */
    isOperational: boolean;
    
    /**
     * @constructor
     * @param statusCode - The HTTP status code of the error.
     * @param message - The error message.
     */
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * @param message - The error message.
     * @returns A new ApiError with the status code 400.
     */
    static badRequest(message: string = "Bad Request") {
        return new ApiError(400, message);
    }

    /**
     * @param message - The error message.
     * @returns A new ApiError with the status code 401.
     */
    static unauthorized(message: string = "Unauthorized") {
        return new ApiError(401, message);
    }

    /**
     * @param message - The error message.
     * @returns A new ApiError with the status code 403.
     */
    static forbidden(message: string = "Forbidden") {
        return new ApiError(403, message);
    }

    /**
     * @param message - The error message.
     * @returns A new ApiError with the status code 404.
     */
    static notFound(message: string = "Not Found") {
        return new ApiError(404, message);
    }

    /**
     * @param message - The error message.
     * @returns A new ApiError with the status code 409.
     */
    static conflict(message: string = "Conflict") {
        return new ApiError(409, message);
    }

    /**
     * @param message - The error message.
     * @returns A new ApiError with the status code 500.
     */
    static internalServerError(message: string = "Internal Server Error") {
        return new ApiError(500, message);
    }
}

export default ApiError;
