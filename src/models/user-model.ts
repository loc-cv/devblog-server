import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: string;
  profilePhoto: string;
  bio?: string;
  postCount: number;
  isBanned: boolean;
  passwordChangedAt?: Date;
  refreshTokens: string[];
  verified: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      trim: true,
      maxlength: [30, 'First name character limit is 30 characters.'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required.'],
      trim: true,
      maxlength: [30, 'Last name character limit is 30 characters.'],
    },
    username: {
      type: String,
      required: [true, 'Username is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    profilePhoto: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [150, 'Bio character limit is 150 characters.'],
    },
    postCount: {
      type: Number,
      default: 0,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    refreshTokens: [String],
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 }, { unique: true });

/**
 * Hash user's password before saving to database.
 * NOTE: This is `save` hook => only executed before .save() or .create()
 */
userSchema.pre('save', async function (next) {
  // only run this middleware if password was actually modified
  if (!this.isModified('password')) return next();

  // hashing password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

/**
 * Update `passwordChangedAt` when updating password
 * NOTE: This is `save` hook => only executed before .save() or .create()
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date();
  next();
});

const User = model<IUser>('User', userSchema);

export default User;
