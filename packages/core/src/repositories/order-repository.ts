import { Order } from '../entities/order';

export interface IOrderRepository {
  createOrder(order: Omit<Order, 'id'>): Promise<string>;
  getOrder(orderId: string): Promise<Order | null>;
  updateOrder(orderId: string, data: Partial<Order>): Promise<void>;
  getRecentOrders(userId: string, limitCount?: number): Promise<Order[]>;
  getAllOrders(limitCount?: number): Promise<Order[]>;
  subscribeToOrders(limitCount: number, callback: (orders: Order[]) => void): () => void;
}
