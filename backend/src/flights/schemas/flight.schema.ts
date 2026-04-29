import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FlightDocument = Flight & Document;

@Schema({ timestamps: true })
export class Flight {
  @Prop({ required: true })
  origin: string; // IATA code, e.g., JFK

  @Prop()
  originCity?: string; // Human-readable city name, e.g., New York

  @Prop({ required: true })
  destination: string; // IATA code, e.g., LHR

  @Prop()
  destinationCity?: string; // Human-readable city name, e.g., London

  @Prop({ required: true })
  departureDate: string; // YYYY-MM-DD format

  @Prop()
  returnDate?: string; // YYYY-MM-DD format for return leg

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
