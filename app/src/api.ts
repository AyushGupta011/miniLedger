import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config';
import { Loan, Summary } from './types';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

const TOKEN_KEY = 'miniledger_token';
let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};
export async function loadToken(): Promise<string | null> {
  token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token;
}
export async function clearToken() {
  token = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (typeof init.body === 'string') headers['Content-Type'] = 'application/json';
  // For FormData we must NOT set Content-Type: fetch adds the multipart boundary itself.
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, `Cannot reach the server at ${API_URL}. Is the backend running and the URL correct?`);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.(); // expired/invalid token -> back to login
    throw new ApiError(res.status, data?.error ?? 'Something went wrong');
  }
  return data as T;
}

export const requestOtp = (phone: string) =>
  request<{ message: string }>('/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone }) });

export async function verifyOtp(phone: string, otp: string) {
  const { token: t } = await request<{ token: string }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });
  token = t;
  await SecureStore.setItemAsync(TOKEN_KEY, t);
}

export const getLoans = () => request<Loan[]>('/loans');
export const getSummary = () => request<Summary>('/loans/summary');
export const createLoan = (body: { friendName: string; amount: number; dueDate: string }) =>
  request<Loan>('/loans', { method: 'POST', body: JSON.stringify(body) });
export const repayLoan = (id: string) => request<Loan>(`/loans/${id}/repay`, { method: 'PATCH' });

export async function uploadReceipt(id: string, uri: string, _mimeType?: string): Promise<Loan> {
  const form = new FormData();
  form.append('receipt', new File(uri) as unknown as Blob);
  let res: Awaited<ReturnType<typeof expoFetch>>;
  try {
    res = await expoFetch(`${API_URL}/loans/${id}/receipt`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
  } catch (e) {
    throw new ApiError(0, `Receipt upload failed: ${(e as Error).message}`);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? 'Receipt upload failed');
  return data as Loan;
}