import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ========== GET - Get single template with details ==========
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const template = await db.feedTemplate.findUnique({ where: { id } });

    if (!template) {
      return NextResponse.json(
        { error: 'Şablon bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...template,
      fields: JSON.parse(template.fields || '[]'),
      requirements: JSON.parse(template.requirements || '{}'),
    });
  } catch (error) {
    console.error('Şablon detayları alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Şablon detayları alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// ========== POST - Increment downloadCount ==========
export async function POST(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const template = await db.feedTemplate.findUnique({ where: { id } });

    if (!template) {
      return NextResponse.json(
        { error: 'Şablon bulunamadı' },
        { status: 404 }
      );
    }

    const updated = await db.feedTemplate.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      template: {
        ...updated,
        fields: JSON.parse(updated.fields || '[]'),
        requirements: JSON.parse(updated.requirements || '{}'),
      },
    });
  } catch (error) {
    console.error('İndirme sayısı güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'İndirme sayısı güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// ========== PUT - Update specific template ==========
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check template exists
    const existing = await db.feedTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Şablon bulunamadı' },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = body.name.trim();
    if (body.description !== undefined) data.description = body.description.trim();
    if (body.platform !== undefined) data.platform = body.platform.trim();
    if (body.format !== undefined) data.format = body.format.trim();
    if (body.category !== undefined) data.category = body.category.trim();
    if (body.sampleUrl !== undefined) data.sampleUrl = body.sampleUrl;
    if (body.isPopular !== undefined) data.isPopular = body.isPopular;
    if (body.downloadCount !== undefined) data.downloadCount = body.downloadCount;
    if (body.rating !== undefined) data.rating = body.rating;
    if (body.storeId !== undefined) data.storeId = body.storeId;
    if (body.fields !== undefined) {
      data.fields = typeof body.fields === 'string'
        ? body.fields
        : JSON.stringify(body.fields);
    }
    if (body.requirements !== undefined) {
      data.requirements = typeof body.requirements === 'string'
        ? body.requirements
        : JSON.stringify(body.requirements);
    }

    const template = await db.feedTemplate.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      template: {
        ...template,
        fields: JSON.parse(template.fields || '[]'),
        requirements: JSON.parse(template.requirements || '{}'),
      },
    });
  } catch (error) {
    console.error('Şablon güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Şablon güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// ========== DELETE - Delete specific template ==========
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const existing = await db.feedTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Şablon bulunamadı' },
        { status: 404 }
      );
    }

    await db.feedTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Şablon silinirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Şablon silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
