import { Document, Schema, Types, model } from 'mongoose';

export interface IComment {
  post: Types.ObjectId;
  author: Types.ObjectId;
  parent: Types.ObjectId | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ICommentDocument = IComment & Document;

const commentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment' },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
    },
  },
  { timestamps: true },
);

const Comment = model<IComment>('Comment', commentSchema);

export default Comment;
