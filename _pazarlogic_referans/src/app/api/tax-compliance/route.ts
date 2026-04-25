import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/tax-compliance — List all tax rules with optional ?country= and ?taxType= filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const country = searchParams.get('country');
    const taxType = searchParams.get('taxType');

    const where: Record<string, unknown> = {};
    if (country) {
      where.country = country;
    }
    if (taxType) {
      where.taxType = taxType;
    }

    const rules = await db.taxComplianceRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rules, { status: 200 });
  } catch (error) {
    console.error('Error fetching tax compliance rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax compliance rules' },
      { status: 500 }
    );
  }
}

// POST /api/tax-compliance — Create a new tax compliance rule
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rule = await db.taxComplianceRule.create({
      data: {
        name: body.name,
        country: body.country ?? 'TR',
        region: body.region ?? '',
        taxType: body.taxType ?? 'vat',
        rate: body.rate ?? 0,
        thresholdMin: body.thresholdMin ?? 0,
        thresholdMax: body.thresholdMax ?? 0,
        category: body.category ?? 'electronics',
        hsCode: body.hsCode ?? '',
        isActive: body.isActive ?? true,
        effectiveDate: body.effectiveDate
          ? new Date(body.effectiveDate)
          : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        notes: body.notes ?? '',
        storeId: body.storeId ?? 'default',
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Error creating tax compliance rule:', error);
    return NextResponse.json(
      { error: 'Failed to create tax compliance rule' },
      { status: 500 }
    );
  }
}

// PUT /api/tax-compliance?id=xxx — Update a tax compliance rule
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.country !== undefined) data.country = body.country;
    if (body.region !== undefined) data.region = body.region;
    if (body.taxType !== undefined) data.taxType = body.taxType;
    if (body.rate !== undefined) data.rate = body.rate;
    if (body.thresholdMin !== undefined) data.thresholdMin = body.thresholdMin;
    if (body.thresholdMax !== undefined) data.thresholdMax = body.thresholdMax;
    if (body.category !== undefined) data.category = body.category;
    if (body.hsCode !== undefined) data.hsCode = body.hsCode;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.effectiveDate !== undefined)
      data.effectiveDate = body.effectiveDate
        ? new Date(body.effectiveDate)
        : null;
    if (body.expiryDate !== undefined)
      data.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.storeId !== undefined) data.storeId = body.storeId;

    const rule = await db.taxComplianceRule.update({
      where: { id },
      data,
    });

    return NextResponse.json(rule, { status: 200 });
  } catch (error) {
    console.error('Error updating tax compliance rule:', error);
    return NextResponse.json(
      { error: 'Failed to update tax compliance rule' },
      { status: 500 }
    );
  }
}

// DELETE /api/tax-compliance?id=xxx — Delete a tax compliance rule
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    await db.taxComplianceRule.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Tax compliance rule deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting tax compliance rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete tax compliance rule' },
      { status: 500 }
    );
  }
}
