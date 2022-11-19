import { Document, Schema, Types, model } from 'mongoose';
import { updateManyPosts } from '../services/post-service';

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

tagSchema.pre('save', async function (next) {
  await updateManyPosts({ 'tags._id': this._id }, { $set: { 'tags.$': this } });
  next();
});

tagSchema.pre('findOneAndDelete', async function (next) {
  const tagToDelete = await this.model.findOne(this.getQuery());
  await updateManyPosts(
    { 'tags._id': tagToDelete._id },
    { $pull: { tags: { _id: tagToDelete._id } } },
  );
  next();
});

const Tag = model<ITag>('Tag', tagSchema);

export default Tag;
