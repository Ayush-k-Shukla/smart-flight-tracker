import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFlightDto } from './dto/create-flight.dto';
import { Flight, FlightDocument } from './schemas/flight.schema';
import { PriceHistory, PriceHistoryDocument } from './schemas/price-history.schema';

@Injectable()
export class FlightsService {
  constructor(
    @InjectModel(Flight.name) private flightModel: Model<FlightDocument>,
    @InjectModel(PriceHistory.name) private priceHistoryModel: Model<PriceHistoryDocument>,
  ) {}

  async create(createFlightDto: CreateFlightDto): Promise<Flight> {
    const createdFlight = new this.flightModel(createFlightDto);
    return createdFlight.save();
  }

  async findAllActive(): Promise<FlightDocument[]> {
    return this.flightModel.find({ isActive: true }).exec();
  }

  async getFlight(flightId: string): Promise<FlightDocument | null> {
    return this.flightModel.findById(flightId).exec();
  }

  async updateFlight(flightId: string | Types.ObjectId, updateData: Partial<Flight>): Promise<FlightDocument | null> {
    return this.flightModel.findByIdAndUpdate(flightId, updateData, { new: true }).exec();
  }

  async getPriceHistory(flightId: string): Promise<PriceHistory[]> {
    return this.priceHistoryModel.find({flightId: new Types.ObjectId(flightId)}).sort({ fetchedAt: 1 }).exec();
  }

  async addPriceHistory(
    flightId: string | Types.ObjectId, 
    data: number | { price: number; airline?: string; flightNumber?: string; departureTime?: string; arrivalTime?: string; duration?: number }
  ): Promise<PriceHistory> {
    const historyData = typeof data === 'number' ? { price: data } : data;
    const history = new this.priceHistoryModel({
      flightId,
      ...historyData,
      fetchedAt: new Date(),
    });
    return history.save();
  }
}
