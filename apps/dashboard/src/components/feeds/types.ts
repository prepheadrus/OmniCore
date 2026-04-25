export interface Feed {
  id: string;
  name: string;
  source: string;
  sourceUrl: string;
  format: string;
  status: string;
  schedule: string;
  lastImport: string | null;
  lastError: string;
  totalProducts: number;
  validProducts: number;
  errorProducts: number;
  fieldMapping: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryMapping {
  id: string;
  source: string;
  sourceCat: string;
  target: string;
  targetCat: string;
  storeId: string;
  createdAt: string;
}
