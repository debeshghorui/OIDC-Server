import jwt from "jsonwebtoken";

/**
 * @interface TokenPayload
 * @description A interface that represents the payload of the token.
 * @property userId - The user ID.
 */
export interface TokenPayload {
    userId: string;
}

/**
 * @function createUserToken
 * @description A function that creates a JWT token for a user.
 * @param payload - The payload of the token.
 * @returns A JWT token.
 */
export const createUserToken = (payload: TokenPayload) => {
    const secret = process.env.JWT_SECRET || "default_secret";
    const expiresIn: NonNullable<jwt.SignOptions["expiresIn"]> =
        (process.env.JWT_EXPIRES_IN as NonNullable<
            jwt.SignOptions["expiresIn"]
        >) || "15m";

    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * @function verifyUserToken
 * @description A function that verifies a JWT token for a user.
 * @param token - The token to verify.
 * @returns The payload of the token or null if the token is invalid.
 */
export const verifyUserToken = (token: string): TokenPayload | null => {
    const secret = process.env.JWT_SECRET || "default_secret";
    try {
        const decoded = jwt.verify(token, secret) as TokenPayload;
        return decoded;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
};
