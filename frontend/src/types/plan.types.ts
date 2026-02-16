export interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlansListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'priceCents' | 'durationDays' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
