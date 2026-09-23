import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../auth/entities/user.entity';

export type ExpenseDocument = HydratedDocument<Expense>;

export enum NecessityType {
  ESSENTIAL = 'ESSENTIAL',
  NOT_ESSENTIAL = 'NOT_ESSENTIAL',
}

export enum ExpenseCategory {
  RENT = 'RENT',
  FOOD = 'FOOD',
  OUTINGS = 'OUTINGS',
  TRANSPORT = 'TRANSPORT',
  SERVICES = 'SERVICES',
  HEALTH = 'HEALTH',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  OTHER = 'OTHER',
}

@Schema({ collection: 'expenses', timestamps: true, toJSON: { virtuals: true } })
export class Expense {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  // Always stored at UTC 00:00 of the given day
  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true, trim: true })
  description!: string;

  // Integer cents (1250 = 12.50)
  @Prop({ required: true, min: 1 })
  amount!: number;

  @Prop({ type: String, enum: NecessityType, required: true })
  necessityType!: NecessityType;

  @Prop({ type: String, enum: ExpenseCategory })
  category?: ExpenseCategory;

  @Prop({ trim: true, maxlength: 50 })
  source?: string;

  // Soft delete marker
  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

ExpenseSchema.index({ userId: 1, date: -1 });

// Week of the month (1..5), computed from the UTC day. Not persisted.
ExpenseSchema.virtual('weekNumber').get(function (this: ExpenseDocument) {
  if (!this.date) return undefined;
  return Math.ceil(this.date.getUTCDate() / 7);
});
