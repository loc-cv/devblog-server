import { Document, model, Schema, Types } from 'mongoose';

export interface IPost {
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  author: Types.ObjectId;
  tags: Types.ObjectId[];
  viewCount: number;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
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
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    viewCount: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

const Post = model<IPost>('Post', postSchema);

export default Post;
