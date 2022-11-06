import { Document, Schema, Types, model } from 'mongoose';

export interface ITag {
  name: string;
  description: string;
  createdBy: Types.ObjectId;
  lastUpdatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ITagDocument = ITag & Document;

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      unique: true,
      trim: true,
      maxlength: [10, 'Tag name character limit is 10 characters'],
    },
    description: {
      type: String,
      required: [true, 'Tag description is required'],
      trim: true,
      maxlength: [100, 'Tag description limit is 100 character'],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const Tag = model<ITag>('Tag', tagSchema);

export default Tag;
