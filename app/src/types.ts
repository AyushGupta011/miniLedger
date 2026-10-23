export type Loan = {
  id: string;
  friendName: string;
  amount: string; // decimal string from the API, e.g. "500.00"
  dueDate: string; // YYYY-MM-DD
  status: 'PENDING' | 'REPAID';
  isOverdue: boolean;
  repaidAt: string | null;
  receiptUrl: string | null;
  createdAt: string;
};

export type Summary = {
  totalLent: string;
  totalRepaid: string;
  overdueAmount: string;
  outstanding: string;
};
