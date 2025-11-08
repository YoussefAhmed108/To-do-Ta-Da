import mongoose, { Document, Schema } from 'mongoose';

export interface IColumn extends Document {
  name: string;
  color: string;
  position: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const columnSchema = new Schema<IColumn>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      required: true,
      default: '#3b82f6' // blue
    },
    position: {
      type: Number,
      required: true,
      default: 0
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
columnSchema.index({ userId: 1, position: 1 });

export default mongoose.model<IColumn>('Column', columnSchema);
