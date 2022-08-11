export type PaginationParams = {
  offset: number;
  limit: number;
};

export type PagedList<TData> = {
  rows: TData[]
} & PaginationParams;

export * from './reservations';
export * from './inventory';
export * from './restaurant';

