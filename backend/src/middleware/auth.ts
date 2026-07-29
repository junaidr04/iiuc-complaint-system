import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Shape of the data we embed inside the JWT and later read back on req.user
export interface AuthPayload {
    id: string;
    role: "student" | "staff" | "admin";
    name: string;
    email: string;
}

// Lets every route handler access req.user with proper typing
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-fallback-secret-change-me";
const TOKEN_EXPIRY = "7d";

// Called from login/register to issue a real, signed JWT
export function generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verifies the "Authorization: Bearer <token>" header on protected routes.
// On success it attaches the decoded user to req.user and calls next().
export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided. Please log in again." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
    }
}

// Use after authenticate() to restrict a route to specific roles, e.g.
// app.get("/api/users", authenticate, authorize("admin"), handler)
export function authorize(...allowedRoles: Array<"student" | "staff" | "admin">) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated." });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "You do not have permission to perform this action." });
        }
        next();
    };
}