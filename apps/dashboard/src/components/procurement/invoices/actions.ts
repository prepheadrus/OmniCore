'use server';

import { cookies } from 'next/headers';
import { InvoiceFormValues } from './schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function createInvoice(data: InvoiceFormValues) {
  try {
    // Transform data to match DTO if necessary, though schema should match
    // Map status from DRAFT | COMPLETED
    const payload = {
      ...data,
      date: new Date(data.date).toISOString(),
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      status: 'DRAFT'
    };

    const response = await fetch(`${API_URL}/procurement/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to create invoice');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

export async function getInvoices(params: { page?: number; limit?: number; supplierId?: string; documentNo?: string; status?: string }) {
  try {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.supplierId) searchParams.append('supplierId', params.supplierId);
    if (params.documentNo) searchParams.append('documentNo', params.documentNo);
    if (params.status) searchParams.append('status', params.status);

    const url = `${API_URL}/procurement/invoices?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // cache: 'no-store' // Disable caching to always get fresh data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch invoices');
    }

    const result = await response.json();
    return { success: true, data: result.data, meta: result.meta };
  } catch (error: any) {
    console.error('Get invoices error:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

export async function getInvoiceById(id: string) {
  try {
    const response = await fetch(`${API_URL}/procurement/invoices/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch invoice');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Get invoice ${id} error:`, error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
