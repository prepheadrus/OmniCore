import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET — List all brand protection alerts, optional ?type=, ?severity=, ?status= filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');

    const alerts = await db.brandProtectionAlert.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(severity ? { severity } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(alerts, { next: { revalidate: 0 } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch brand protection alerts' },
      { status: 500 },
    );
  }
}

// POST — Create a new brand protection alert
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Normalize array fields to JSON strings if passed as objects
    const evidence =
      body.evidence !== undefined
        ? typeof body.evidence === 'string'
          ? body.evidence
          : JSON.stringify(body.evidence)
        : '[]';

    const alert = await db.brandProtectionAlert.create({
      data: {
        type: body.type ?? 'map_violation',
        productId: body.productId ?? '',
        productName: body.productName ?? '',
        sku: body.sku ?? '',
        marketplace: body.marketplace ?? '',
        seller: body.seller ?? '',
        sellerUrl: body.sellerUrl ?? '',
        detectedPrice: body.detectedPrice ?? 0,
        mapPrice: body.mapPrice ?? 0,
        ourPrice: body.ourPrice ?? 0,
        violationAmount: body.violationAmount ?? 0,
        evidence,
        severity: body.severity ?? 'medium',
        status: body.status ?? 'detected',
        actionTaken: body.actionTaken ?? '',
        reportedAt: body.reportedAt ? new Date(body.reportedAt) : null,
        resolvedAt: body.resolvedAt ? new Date(body.resolvedAt) : null,
        notes: body.notes ?? '',
        storeId: body.storeId ?? 'default',
      },
    });

    return NextResponse.json(alert, { status: 201, next: { revalidate: 0 } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create brand protection alert' },
      { status: 500 },
    );
  }
}

// PUT — Update a brand protection alert (change status, add notes, etc.)
export async function PUT(req: Request) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await req.json();

    // Normalize array fields and convert date strings
    const updateData: Record<string, unknown> = { ...body };
    if (updateData.evidence !== undefined) {
      updateData.evidence =
        typeof updateData.evidence === 'string'
          ? updateData.evidence
          : JSON.stringify(updateData.evidence);
    }
    if (updateData.reportedAt !== undefined && updateData.reportedAt) {
      updateData.reportedAt = new Date(updateData.reportedAt as string);
    }
    if (updateData.resolvedAt !== undefined && updateData.resolvedAt) {
      updateData.resolvedAt = new Date(updateData.resolvedAt as string);
    }

    const alert = await db.brandProtectionAlert.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(alert, { next: { revalidate: 0 } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update brand protection alert' },
      { status: 500 },
    );
  }
}

// DELETE — Delete a brand protection alert
export async function DELETE(req: Request) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.brandProtectionAlert.delete({ where: { id } });

    return NextResponse.json({ success: true }, { next: { revalidate: 0 } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete brand protection alert' },
      { status: 500 },
    );
  }
}
