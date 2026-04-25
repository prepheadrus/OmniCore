import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, name, apiKey, apiSecret, shopUrl } = body;

    if (!platform || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Gerçekte burada platform API'sine bir deneme (ping) atilip anahtarlarin
    // dogru olup olmadigi kontrol edilir (Örn: auth test endpoint'ine istek)

    const integration = await db.integration.create({
      data: {
        name,
        platform,
        type: platform.includes('Trendyol') || platform.includes('Hepsiburada') || platform.includes('Amazon') ? 'marketplace' : 'ecommerce',
        status: 'connected',
        apiKey,
        apiSecret,
        shopUrl: shopUrl || '',
        storeId: 'default'
      }
    });

    return NextResponse.json({ success: true, integration });

  } catch (error) {
    console.error('Integration setup error:', error);
    return NextResponse.json({ error: 'Failed to setup integration' }, { status: 500 });
  }
}
