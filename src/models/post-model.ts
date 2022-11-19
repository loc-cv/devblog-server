import { Document, model, Schema, Types } from 'mongoose';

export interface IPost {
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  author: {
    _id: Types.ObjectId;
    username: string;
    isBanned: boolean;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profilePhoto: string;
    bio: string;
    postCount: string;
  };
  tags: { _id: Types.ObjectId; name: string; description: string }[];
  viewCount: number;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  savedBy: Types.ObjectId[];
  updatedAt: Date;
  createdAt: Date;
}

export type IPostDocument = IPost & Document;

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [100, 'Title character limit is 100 characters'],
    },
    summary: {
      type: String,
      required: [true, 'Post summary is required'],
      trim: true,
      maxlength: [200, 'Summary character limit is 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    coverImage: String,
    author: {
      _id: { type: Schema.Types.ObjectId, ref: 'User' },
      username: String,
      isBanned: { type: Boolean, default: false },
      firstName: String,
      lastName: String,
      email: String,
      role: String,
      profilePhoto: String,
      bio: String,
      postCount: String,
    },
    tags: [
      {
        _id: { type: Schema.Types.ObjectId, ref: 'Tag' },
        name: String,
        description: String,
      },
    ],
    viewCount: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    savedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

const Post = model<IPost>('Post', postSchema);

export default Post;
