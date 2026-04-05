"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizeRole = exports.ProtectRoute = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ProtectRoute = (req, res, next) => {
    try {
        let token = req.cookies?.token;
        // Fallback for manual cookie parsing like the previous project if cookie-parser fails to inject
        if (!token && req.headers.cookie) {
            token = req.headers.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
        }
        if (!token) {
            res.status(401).json({ message: 'Unauthorized: No token provided' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
exports.ProtectRoute = ProtectRoute;
const AuthorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
            return;
        }
        next();
    };
};
exports.AuthorizeRole = AuthorizeRole;
