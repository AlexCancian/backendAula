import jwt from 'jsonwebtoken';

export default function generateScraperJWT() {
    const secret = process.env.SECRET_SERVICE;
    if (!secret) {
        throw new Error("SECRET_SERVICE is not defined");
    }
    return jwt.sign(
        {
            sub: "scraper-service",
            type: "SERVICE"
        },
        secret,
        {
            expiresIn: "5m",
            issuer: "api-principal"
        }
    );
}