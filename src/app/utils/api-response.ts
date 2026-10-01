import type { Response } from "express";

class ApiResponse {
    /**
     * @param res - The response object.
     * @param message - The message of the response.
     * @param data - The data of the response.
     * @returns A JSON response with the status code 200.
     */
    static success(res: Response, message = "ok", data: object) {
        res.status(200).json({
            success: true,
            message,
            data,
        });
    }

    /**
     * @param res - The response object.
     * @param message - The message of the response.
     * @param data - The data of the response.
     * @returns A JSON response with the status code 201.
     */
    static created(res: Response, message = "ok", data: object) {
        res.status(201).json({
            success: true,
            message,
            data,
        });
    }

    /**
     * @param res - The response object.
     * @param message - The message of the response.
     * @returns A JSON response with the status code 204.
     */
    static noContent(res: Response, message = "ok") {
        res.status(204).json({
            success: true,
            message,
        });
    }
}

export default ApiResponse;
