import { Document, Schema, Types, model } from 'mongoose';

export interface IReport {
  post: Types.ObjectId;
  submittedBy: Types.ObjectId;
  reason: string;
  status: 'unsolved' | 'solved';
  createdAt: Date;
  updatedAt: Date;
}

export type IReportDocument = IReport & Document;

const reportSchema = new Schema<IReport>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['unsolved', 'solved'],
      default: 'unsolved',
    },
  },
  { timestamps: true },
);

const Report = model<IReport>('Report', reportSchema);

export default Report;
