import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ========== GET - List templates with pagination, search, and filters ==========
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));
    const search = searchParams.get('search') || '';
    const platform = searchParams.get('platform') || '';
    const category = searchParams.get('category') || '';
    const format = searchParams.get('format') || '';
    const sort = searchParams.get('sort') || 'newest';

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (platform) {
      where.platform = platform;
    }

    if (category) {
      where.category = category;
    }

    if (format) {
      where.format = format;
    }

    // Build orderBy clause
    let orderBy: Record<string, string> = { createdAt: 'desc' };
    switch (sort) {
      case 'popular':
        orderBy = { downloadCount: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'downloaded':
        orderBy = { downloadCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Fetch templates and counts in parallel
    const [templates, total, platforms, categories] = await Promise.all([
      db.feedTemplate.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.feedTemplate.count({ where }),
      db.feedTemplate.findMany({
        distinct: ['platform'],
        select: { platform: true },
        where: { platform: { not: '' } },
      }),
      db.feedTemplate.findMany({
        distinct: ['category'],
        select: { category: true },
        where: { category: { not: '' } },
      }),
    ]);

    // Seed demo templates if DB is empty
    if (total === 0 && !search && !platform && !category && !format && page === 1) {
      const demoTemplates = [
        { name: 'Trendyol Standart XML', description: 'Trendyol pazaryeri icin standart urun feed sablonu. Tum zorunlu alanlar icerir.', platform: 'Trendyol', format: 'xml', category: 'pazaryeri', fields: JSON.stringify(['product_id','title','description','price','stock','sku','barcode','brand','category','image_url','vat_rate']), requirements: JSON.stringify({required:['product_id','title','price','stock'],recommended:['barcode','brand','image_url']}), isPopular: true, downloadCount: 1247, rating: 4.8 },
        { name: 'Hepsiburada Product Feed', description: 'Hepsiburada pazaryeri urun listesi sablonu. Kategori eslestirme dahil.', platform: 'Hepsiburada', format: 'xml', category: 'pazaryeri', fields: JSON.stringify(['product_id','name','description','sale_price','list_price','stock','sku','barcode','brand','category','cargo_type']), requirements: JSON.stringify({required:['product_id','name','sale_price','stock'],recommended:['barcode','brand']}), isPopular: true, downloadCount: 982, rating: 4.6 },
        { name: 'Amazon TR Listing', description: 'Amazon Turkiye urun listeleme sablonu. Buy Box optimizasyonu icin hazir.', platform: 'Amazon TR', format: 'xml', category: 'pazaryeri', fields: JSON.stringify(['product_id','title','bullet_points','description','price','sale_price','quantity','sku','ean','brand','category','main_image','images']), requirements: JSON.stringify({required:['product_id','title','price','quantity','sku'],recommended:['ean','brand','bullet_points']}), isPopular: true, downloadCount: 856, rating: 4.7 },
        { name: 'n11 Standart Feed', description: 'n11 pazaryeri icin urun feed sablonu.', platform: 'n11', format: 'xml', category: 'pazaryeri', fields: JSON.stringify(['product_id','title','description','price','stock','sku','barcode','brand','category','image']), requirements: JSON.stringify({required:['product_id','title','price','stock']}), isPopular: false, downloadCount: 543, rating: 4.3 },
        { name: 'Google Shopping Feed', description: 'Google Merchant Center icin standart shopping feed. Performans puanlamaya uygun.', platform: 'Google Shopping', format: 'xml', category: 'reklam', fields: JSON.stringify(['id','title','description','price','link','image_link','brand','gtin','mpn','condition','availability','google_product_category']), requirements: JSON.stringify({required:['id','title','price','link','image_link','availability'],recommended:['brand','gtin','google_product_category']}), isPopular: true, downloadCount: 2103, rating: 4.9 },
        { name: 'Facebook Catalog Feed', description: 'Facebook ve Instagram reklam katalogu icin feed sablonu. Dinamik reklamlar icin ideal.', platform: 'Facebook Catalog', format: 'csv', category: 'reklam', fields: JSON.stringify(['id','title','description','price','availability','image_url','url','brand','gtin','category']), requirements: JSON.stringify({required:['id','title','price','image_url','availability']}), isPopular: true, downloadCount: 1567, rating: 4.5 },
        { name: 'Shopify Import CSV', description: 'Shopify magazasina urun importu icin CSV sablonu. Varyant destekli.', platform: 'Shopify', format: 'csv', category: 'e-ticaret', fields: JSON.stringify(['handle','title','body_html','vendor','product_type','tags','published','variant_sku','variant_price','variant_compare_at_price','variant_inventory_qty','image_src','variant_weight_unit']), requirements: JSON.stringify({required:['handle','title','variant_sku','variant_price']}), isPopular: false, downloadCount: 789, rating: 4.4 },
        { name: 'Ciceksepeti Product XML', description: 'Ciceksepeti pazaryeri icin urun feed sablonu.', platform: 'Ciceksepeti', format: 'xml', category: 'pazaryeri', fields: JSON.stringify(['product_id','title','description','price','stock','sku','barcode','brand','category','image_url','delivery_time']), requirements: JSON.stringify({required:['product_id','title','price','stock']}), isPopular: false, downloadCount: 321, rating: 4.1 },
        { name: 'WooCommerce Product Import', description: 'WooCommerce magazasina urun importu icin CSV sablonu.', platform: 'WooCommerce', format: 'csv', category: 'e-ticaret', fields: JSON.stringify(['name','short_description','description','sku','regular_price','sale_price','stock_quantity','category','images','attributes']), requirements: JSON.stringify({required:['name','sku','regular_price']}), isPopular: false, downloadCount: 654, rating: 4.2 },
        { name: 'Instagram Shopping Catalog', description: 'Instagram Shopping icin urun katalogu sablonu. Urun etiketleme destegi.', platform: 'Instagram Shopping', format: 'csv', category: 'sosyal-medya', fields: JSON.stringify(['id','title','description','price','availability','image_url','url','brand','category','sale_price']), requirements: JSON.stringify({required:['id','title','price','image_url','availability']}), isPopular: true, downloadCount: 1123, rating: 4.6 },
        { name: 'PTT AVM Product Feed', description: 'PTT AVM pazaryeri icin standart urun feed sablonu.', platform: 'PTT AVM', format: 'xml', category: 'pazaryeri', fields: JSON.stringify(['product_id','title','description','price','stock','sku','barcode','brand','category','image_url']), requirements: JSON.stringify({required:['product_id','title','price','stock']}), isPopular: false, downloadCount: 198, rating: 3.9 },
        { name: 'Morhipo Product Feed', description: 'Morhipo pazaryeri icin urun listeleme sablonu.', platform: 'Morhipo', format: 'xml', category: 'pazaryeri', fields: JSON.stringify(['product_id','title','description','price','stock','sku','barcode','brand','category','image']), requirements: JSON.stringify({required:['product_id','title','price','stock']}), isPopular: false, downloadCount: 167, rating: 3.8 },
      ];
      await db.feedTemplate.createMany({ data: demoTemplates });
      const seeded = await db.feedTemplate.findMany({ orderBy, take: limit });
      const allPlatforms = await db.feedTemplate.findMany({ distinct: ['platform'], select: { platform: true }, where: { platform: { not: '' } } });
      const allCategories = await db.feedTemplate.findMany({ distinct: ['category'], select: { category: true }, where: { category: { not: '' } } });
      const seededCount = await db.feedTemplate.count();
      return NextResponse.json({
        templates: seeded.map((t) => ({ ...t, fields: JSON.parse(t.fields || '[]'), requirements: JSON.parse(t.requirements || '{}') })),
        total: seededCount,
        page,
        totalPages: Math.ceil(seededCount / limit),
        platforms: allPlatforms.map((p) => p.platform),
        categories: allCategories.map((c) => c.category),
      });
    }

    // Parse JSON string fields back to objects for response
    const parsedTemplates = templates.map((t) => ({
      ...t,
      fields: JSON.parse(t.fields || '[]'),
      requirements: JSON.parse(t.requirements || '{}'),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      templates: parsedTemplates,
      total,
      page,
      totalPages,
      platforms: platforms.map((p) => p.platform),
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    console.error('Şablonlar listelenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Şablonlar listelenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// ========== POST - Create new template ==========
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, description, platform, format, category, fields, requirements } = body;

    // Validate required fields
    if (!name || !platform) {
      return NextResponse.json(
        { error: 'Şablon adı ve platform alanları zorunludur' },
        { status: 400 }
      );
    }

    if (!name.trim()) {
      return NextResponse.json(
        { error: 'Şablon adı boş olamaz' },
        { status: 400 }
      );
    }

    const template = await db.feedTemplate.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        platform: platform.trim(),
        format: format?.trim() || 'xml',
        category: category?.trim() || '',
        fields: fields ? JSON.stringify(fields) : '[]',
        requirements: requirements ? JSON.stringify(requirements) : '{}',
        storeId: body.storeId || 'default',
      },
    });

    return NextResponse.json(
      {
        success: true,
        template: {
          ...template,
          fields: JSON.parse(template.fields || '[]'),
          requirements: JSON.parse(template.requirements || '{}'),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Şablon oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Şablon oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// ========== PUT - Update template ==========
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Şablon ID alanı zorunludur' },
        { status: 400 }
      );
    }

    // Check template exists
    const existing = await db.feedTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Şablon bulunamadı' },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    if (updateData.name !== undefined) data.name = updateData.name.trim();
    if (updateData.description !== undefined) data.description = updateData.description.trim();
    if (updateData.platform !== undefined) data.platform = updateData.platform.trim();
    if (updateData.format !== undefined) data.format = updateData.format.trim();
    if (updateData.category !== undefined) data.category = updateData.category.trim();
    if (updateData.sampleUrl !== undefined) data.sampleUrl = updateData.sampleUrl;
    if (updateData.isPopular !== undefined) data.isPopular = updateData.isPopular;
    if (updateData.downloadCount !== undefined) data.downloadCount = updateData.downloadCount;
    if (updateData.rating !== undefined) data.rating = updateData.rating;
    if (updateData.storeId !== undefined) data.storeId = updateData.storeId;
    if (updateData.fields !== undefined) {
      data.fields = typeof updateData.fields === 'string'
        ? updateData.fields
        : JSON.stringify(updateData.fields);
    }
    if (updateData.requirements !== undefined) {
      data.requirements = typeof updateData.requirements === 'string'
        ? updateData.requirements
        : JSON.stringify(updateData.requirements);
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

// ========== DELETE - Delete template ==========
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Şablon ID alanı zorunludur' },
        { status: 400 }
      );
    }

    // Check template exists
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
