import jwt from "jsonwebtoken";
import config from "../config/EVConfig.js";

export default function generateToken(userId, tokenType) {

    let secret;
    let expiresIn;

    switch (tokenType) {

        case "ACCESSTOKEN":
            secret = config.ACCESSTOKEN;
            expiresIn = "2d";
            break;

        case "REFRESHTOKEN":
            secret = config.REFRESHTOKEN;
            expiresIn = "7d";
            break;

        default:
            throw new Error("Invalid token type");
    }

    return jwt.sign(
        { id: userId },
        secret,
        { expiresIn }
    );
}