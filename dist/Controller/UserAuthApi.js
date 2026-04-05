"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutUser = exports.LoginUser = exports.RegisterUser = void 0;
const UserModel_1 = require("../model/UserModel");
const Utils_1 = require("./Utils");
const RegisterUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Name, email, and password are required' });
            return;
        }
        const existingUser = await UserModel_1.UserModel.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const hashedPassword = await (0, Utils_1.HashPassword)(password);
        // Only allow assigning specific roles if necessary, default to Viewer if not provided
        const userRole = Object.values(UserModel_1.UserRole).includes(role) ? role : UserModel_1.UserRole.Viewer;
        const newUser = await UserModel_1.UserModel.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
        });
        const token = (0, Utils_1.GenerateToken)(newUser._id.toString(), newUser.role);
        (0, Utils_1.SetCookie)(res, token);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
            token
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.RegisterUser = RegisterUser;
const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const user = await UserModel_1.UserModel.findOne({ email });
        if (!user || !user.password) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = await (0, Utils_1.ComparePassword)(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = (0, Utils_1.GenerateToken)(user._id.toString(), user.role);
        (0, Utils_1.SetCookie)(res, token);
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.LoginUser = LoginUser;
const LogoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.LogoutUser = LogoutUser;
