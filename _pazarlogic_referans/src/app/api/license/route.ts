import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const licenses = await db.license.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(licenses);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, key, ownerName, ownerEmail, company } = body;

    if (action === 'activate') {
      const existing = await db.license.findFirst({ where: { key } });
      if (!existing) {
        return NextResponse.json({ error: 'Gecersiz lisans anahtari' }, { status: 404 });
      }
      if (existing.status === 'active') {
        const isExpired = existing.expiresAt && new Date(existing.expiresAt) < new Date();
        if (isExpired) {
          await db.license.update({ where: { id: existing.id }, data: { status: 'expired' } });
          return NextResponse.json({ error: 'Lisans sure doldu', license: { ...existing, status: 'expired' } }, { status: 400 });
        }
        return NextResponse.json({ success: true, license: existing });
      }
      const updated = await db.license.update({
        where: { id: existing.id },
        data: {
          status: 'active',
          activatedAt: new Date(),
          ownerName: ownerName || existing.ownerName,
          ownerEmail: ownerEmail || existing.ownerEmail,
          company: company || existing.company,
        },
      });
      return NextResponse.json({ success: true, license: updated });
    }

    if (action === 'trial') {
      const trialLicense = await db.license.create({
        data: {
          key: `PL-TRIAL-${Date.now().toString(36).toUpperCase()}`,
          status: 'active',
          licenseType: 'trial',
          ownerName: ownerName || 'Trial Kullanici',
          ownerEmail: ownerEmail || '',
          company: company || '',
          activatedAt: new Date(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          features: 'all',
        },
      });
      return NextResponse.json({ success: true, license: trialLicense });
    }

    return NextResponse.json({ error: 'Gecersiz islem' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
