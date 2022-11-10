import bcrypt from 'bcryptjs';
import { Document, model, Model, Schema, Types } from 'mongoose';

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
  savedPosts: Types.ObjectId[];
  isBanned: boolean;
  passwordChangedAt?: Date;
  refreshTokens: Types.Array<string>;
  verified: boolean;
  updatedAt: Date;
  createdAt: Date;
}

interface IUserMethods {
  comparePasswords(candidatePassword: string): Promise<boolean>;
  checkPasswordChanged(tokenIat: number): boolean;
}

type UserModel = Model<IUser, {}, IUserMethods>;

export type IUserDocument = IUser & Document;

export const excludedFields = [
  'password',
  'passwordChangedAt',
  'refreshTokens',
];

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
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
      unique: true,
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
    savedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
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
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

/**
 * Hash user's password before saving to database.
 *
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
 * Update `passwordChangedAt` when updating password.
 *
 * NOTE: This is `save` hook => only executed before .save() or .create()
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date();
  next();
});

/**
 * Compare password with ecrypted one.
 *
 * @async
 * @param candidatePassword - Password to be compared with ecrypted password.
 * @returns A promise whose resolved value is true if 2 passwords are equal, false otherwise.
 */
userSchema.methods.comparePasswords = async function (
  candidatePassword: string,
) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

/**
 * Check if user changed password after the token was issued.
 *
 * @param tokenIat - The time at which token was issued (in seconds).
 * @returns true if password has been modified after the token was issued, false otherwise.
 */
userSchema.methods.checkPasswordChanged = function (tokenIat: number) {
  if (this.passwordChangedAt) {
    return this.passwordChangedAt.getTime() / 1000 - 1 > tokenIat;
  }
  return false;
};

const User = model<IUser, UserModel>('User', userSchema);

export default User;
