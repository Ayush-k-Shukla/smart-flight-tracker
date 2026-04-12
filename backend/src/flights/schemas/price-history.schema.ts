import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Flight } from './flight.schema';

export type PriceHistoryDocument = PriceHistory & Document;

@Schema({ timestamps: true })
export class PriceHistory {
  @Prop({ type: Types.ObjectId, ref: Flight.name, required: true })
  flightId: Flight | Types.ObjectId;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 'INR' })
  currency: string;

  @Prop({ required: true })
  fetchedAt: Date;
}

export const PriceHistorySchema = SchemaFactory.createForClass(PriceHistory);
