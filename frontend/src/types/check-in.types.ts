export interface CheckIn {
  id: string;
  memberId: string;
  membershipId: string;
  checkedInAt: string;
}

export interface CreateCheckInInput {
  checkedInAt?: string;
}

export interface CheckInsListParams {
  page?: number;
  pageSize?: number;
  memberId?: string;
  membershipId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'checkedInAt';
  sortOrder?: 'asc' | 'desc';
}
