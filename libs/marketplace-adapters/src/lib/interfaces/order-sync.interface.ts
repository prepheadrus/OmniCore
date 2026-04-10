import { StandardOrderDto } from '../dtos/standard-order.dto';

export interface IOrderSync {
  fetchOrders(startDate: Date, endDate: Date): Promise<StandardOrderDto[]>;
}
