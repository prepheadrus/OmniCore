'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export async function saveProductAction(data: any, channelId: string) {
  try {
    const res = await fetch(`${API_URL}/products/upsert/action`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-channel-id': channelId,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to save product: ${res.status}`);
    }

    const result = await res.json();

    // Invalidate the cache for the products page
    revalidatePath('/products');
    revalidatePath('/products/[id]', 'page');

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error saving product:', error);
    return { success: false, error: error.message || 'Bir hata oluştu.' };
  }
}

export async function updateProductInlineAction(productId: string, data: any, channelId: string) {
  try {
    // Re-use the upsert action for inline edits, passing the ID and minimal required data
    // Assuming the DTO allows partial updates if we use the same endpoint,
    // or we can call the regular PUT /products/:id endpoint if it fits better.
    // For now, let's call the upsert action with the partial data including ID.
    const payload = {
      id: productId,
      ...data,
    };

    const res = await fetch(`${API_URL}/products/upsert/action`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-channel-id': channelId,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update product inline: ${res.status}`);
    }

    revalidatePath('/products');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating product inline:', error);
    return { success: false, error: error.message || 'Güncelleme başarısız.' };
  }
}
