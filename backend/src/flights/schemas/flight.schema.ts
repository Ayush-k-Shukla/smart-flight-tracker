import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FlightDocument = Flight & Document;

@Schema({ timestamps: true })
export class Flight {
  @Prop({ required: true })
  origin: string; // IATA code, e.g., JFK

  @Prop({ required: true })
  destination: string; // IATA code, e.g., LHR

  @Prop({ required: true })
  departureDate: string; // YYYY-MM-DD format

  @Prop({ default: true })
  isActive: boolean; // Whether the system is still tracking this flight

  @Prop()
  aiRecommendation?: string;

  @Prop()
  aiExplanation?: string;

  @Prop()
  lastInsightGeneratedAt?: Date;
}

export const FlightSchema = SchemaFactory.createForClass(Flight);
