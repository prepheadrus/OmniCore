'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function createPurchaseInvoiceAction(data: any, channelId: string) {
  if (!channelId) {
    throw new Error('Lütfen önce bir satış kanalı seçin.');
  }

  const response = await fetch(`${API_URL}/purchase-invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-channel-id': channelId,
    },
    body: JSON.stringify({
      ...data,
      channelId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Alış faturası kaydedilemedi');
  }

  revalidatePath('/procurement/purchase-invoices');
  return await response.json();
}

export async function fetchPurchaseInvoicesAction(page = 1, limit = 10, search = '', channelId: string) {
  if (!channelId) {
    throw new Error('Lütfen önce bir satış kanalı seçin.');
  }

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search ? { search } : {}),
  });

  const response = await fetch(`${API_URL}/purchase-invoices?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'x-channel-id': channelId,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Alış faturaları getirilemedi');
  }

  return await response.json();
}
