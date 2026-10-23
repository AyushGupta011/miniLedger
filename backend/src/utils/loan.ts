export type LoanStatus = 'PENDING' | 'REPAID';

/** Today's date as YYYY-MM-DD in UTC. Single source of truth for "overdue". */
export function todayUtc(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** A loan is overdue when it is still pending and its due date is before today. */
export function isOverdue(status: LoanStatus, dueDate: string, today: string = todayUtc()): boolean {
  return status === 'PENDING' && dueDate < today; // ISO dates compare correctly as strings
}
