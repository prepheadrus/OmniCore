export enum JobTypes {
  SYNC_ORDER = 'SYNC_ORDER',
  SYNC_PRODUCT = 'SYNC_PRODUCT',
  FETCH_ORDERS = 'FETCH_ORDERS',
  FETCH_PRODUCTS = 'FETCH_PRODUCTS',
  GENERATE_INVOICE = 'GENERATE_INVOICE',
  GENERATE_CARGO_BARCODE = 'GENERATE_CARGO_BARCODE',
}

export const MARKETPLACE_SYNC_QUEUE = 'marketplace-sync-queue';
export const INVOICE_QUEUE = 'invoice-queue';
export const CARGO_QUEUE = 'cargo-queue';
