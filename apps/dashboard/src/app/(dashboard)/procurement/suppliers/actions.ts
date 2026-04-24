'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function saveSupplierAction(data: any) {
  const isUpdate = !!data.id;
  const url = isUpdate ? `${API_URL}/suppliers/${data.id}` : `${API_URL}/suppliers`;
  const method = isUpdate ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
    throw new Error(errorMessage || 'Tedarikçi kaydedilemedi');
  }

  revalidatePath('/procurement/suppliers');
  return await response.json();
}

export async function deleteSupplierAction(id: string) {
  const response = await fetch(`${API_URL}/suppliers/${id}`, {
    method: 'DELETE',
    headers: {
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Tedarikçi silinemedi');
  }

  revalidatePath('/procurement/suppliers');
  return true;
}
