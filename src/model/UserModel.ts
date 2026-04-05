import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  Viewer = 'Viewer',
  Analyst = 'Analyst',
  Admin = 'Admin',
}

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Viewer,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.Active,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', userSchema);
