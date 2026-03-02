export interface FindByCriteriaQuery {
  ids?: string[];
  skus?: string[];
  category?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  sortByPurchaseCount?: 'asc' | 'desc';
}
