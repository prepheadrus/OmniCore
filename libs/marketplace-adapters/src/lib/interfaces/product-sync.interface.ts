import { StandardProductDto } from '../dtos/standard-product.dto';

export interface IProductSync {
  fetchProducts(limit?: number, offset?: number): Promise<StandardProductDto[]>;
}
