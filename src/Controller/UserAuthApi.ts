import { Request, Response } from 'express';
import { UserModel, UserRole } from '../model/UserModel';
import { GenerateToken, HashPassword, ComparePassword, SetCookie } from './Utils';

export const RegisterUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await HashPassword(password);

    // Only allow assigning specific roles if necessary, default to Viewer if not provided
    const userRole = Object.values(UserRole).includes(role) ? role : UserRole.Viewer;

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const token = GenerateToken(newUser._id.toString(), newUser.role);
    SetCookie(res, token);

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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const LoginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await UserModel.findOne({ email });
    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await ComparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = GenerateToken(user._id.toString(), user.role);
    SetCookie(res, token);

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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const LogoutUser = (req: Request, res: Response): void => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
