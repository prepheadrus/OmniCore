import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/** Recalculate all computed profit fields from input values */
function calculateProfit(data: {
  sellingPrice: number;
  costPrice: number;
  shippingCost: number;
  marketplaceFee: number;
  paymentFee: number;
  taxRate: number;
  taxAmount: number;
  packagingCost: number;
  returnCost: number;
  advertisingCost: number;
  otherCosts: number;
  monthlyUnits: number;
}) {
  // Compute taxAmount if taxRate and sellingPrice are present
  const taxAmount =
    data.taxAmount ?? (data.sellingPrice * data.taxRate) / 100;

  const totalCost =
    data.costPrice +
    data.shippingCost +
    data.marketplaceFee +
    data.paymentFee +
    taxAmount +
    data.packagingCost +
    data.returnCost +
    data.advertisingCost +
    data.otherCosts;

  const netProfit = data.sellingPrice - totalCost;

  const profitMargin =
    data.sellingPrice > 0 ? (netProfit / data.sellingPrice) * 100 : 0;

  const investmentCost = data.costPrice + data.advertisingCost + data.otherCosts;
  const roi = investmentCost > 0 ? (netProfit / investmentCost) * 100 : 0;

  const breakEvenUnits =
    netProfit > 0 ? Math.ceil(totalCost / netProfit) : 0;

  const monthlyProfit = netProfit * data.monthlyUnits;
  const yearlyProfit = monthlyProfit * 12;

  return {
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    breakEvenUnits,
    monthlyProfit: Math.round(monthlyProfit * 100) / 100,
    yearlyProfit: Math.round(yearlyProfit * 100) / 100,
  };
}

// GET /api/profit-simulator — List all simulations with optional ?marketplace= filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const marketplace = searchParams.get('marketplace');

    const where: Record<string, unknown> = {};
    if (marketplace) {
      where.marketplace = marketplace;
    }

    const simulations = await db.profitSimulation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(simulations, { status: 200 });
  } catch (error) {
    console.error('Error fetching profit simulations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profit simulations' },
      { status: 500 }
    );
  }
}

// POST /api/profit-simulator — Create a new simulation with auto-calculated fields
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const inputFields = {
      sellingPrice: body.sellingPrice ?? 0,
      costPrice: body.costPrice ?? 0,
      shippingCost: body.shippingCost ?? 0,
      marketplaceFee: body.marketplaceFee ?? 0,
      paymentFee: body.paymentFee ?? 0,
      taxRate: body.taxRate ?? 0,
      taxAmount: body.taxAmount ?? 0,
      packagingCost: body.packagingCost ?? 0,
      returnCost: body.returnCost ?? 0,
      advertisingCost: body.advertisingCost ?? 0,
      otherCosts: body.otherCosts ?? 0,
      monthlyUnits: body.monthlyUnits ?? 0,
    };

    const computed = calculateProfit(inputFields);

    const simulation = await db.profitSimulation.create({
      data: {
        name: body.name,
        description: body.description ?? '',
        productId: body.productId ?? '',
        productName: body.productName ?? '',
        sku: body.sku ?? '',
        marketplace: body.marketplace ?? '',
        scenario: body.scenario ?? 'single',
        sellingPrice: inputFields.sellingPrice,
        costPrice: inputFields.costPrice,
        shippingCost: inputFields.shippingCost,
        marketplaceFee: inputFields.marketplaceFee,
        paymentFee: inputFields.paymentFee,
        taxRate: inputFields.taxRate,
        taxAmount: computed.taxAmount,
        packagingCost: inputFields.packagingCost,
        returnRate: body.returnRate ?? 0,
        returnCost: inputFields.returnCost,
        advertisingCost: inputFields.advertisingCost,
        otherCosts: inputFields.otherCosts,
        totalCost: computed.totalCost,
        netProfit: computed.netProfit,
        profitMargin: computed.profitMargin,
        roi: computed.roi,
        breakEvenUnits: computed.breakEvenUnits,
        monthlyUnits: inputFields.monthlyUnits,
        monthlyProfit: computed.monthlyProfit,
        yearlyProfit: computed.yearlyProfit,
        comparisonData: body.comparisonData ?? '[]',
        status: body.status ?? 'draft',
        storeId: body.storeId ?? 'default',
      },
    });

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    console.error('Error creating profit simulation:', error);
    return NextResponse.json(
      { error: 'Failed to create profit simulation' },
      { status: 500 }
    );
  }
}

// PUT /api/profit-simulator?id=xxx — Update simulation and recalculate computed fields
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

    // Build input fields from the incoming body, falling back to defaults
    const inputFields = {
      sellingPrice: body.sellingPrice ?? 0,
      costPrice: body.costPrice ?? 0,
      shippingCost: body.shippingCost ?? 0,
      marketplaceFee: body.marketplaceFee ?? 0,
      paymentFee: body.paymentFee ?? 0,
      taxRate: body.taxRate ?? 0,
      taxAmount: body.taxAmount ?? 0,
      packagingCost: body.packagingCost ?? 0,
      returnCost: body.returnCost ?? 0,
      advertisingCost: body.advertisingCost ?? 0,
      otherCosts: body.otherCosts ?? 0,
      monthlyUnits: body.monthlyUnits ?? 0,
    };

    const computed = calculateProfit(inputFields);

    const data: Record<string, unknown> = {
      ...computed,
    };

    // Merge in any other user-provided scalar fields
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.productId !== undefined) data.productId = body.productId;
    if (body.productName !== undefined) data.productName = body.productName;
    if (body.sku !== undefined) data.sku = body.sku;
    if (body.marketplace !== undefined) data.marketplace = body.marketplace;
    if (body.scenario !== undefined) data.scenario = body.scenario;
    if (body.returnRate !== undefined) data.returnRate = body.returnRate;
    if (body.status !== undefined) data.status = body.status;
    if (body.storeId !== undefined) data.storeId = body.storeId;
    if (body.comparisonData !== undefined)
      data.comparisonData = body.comparisonData;

    // Ensure cost-related input fields are also persisted
    data.sellingPrice = inputFields.sellingPrice;
    data.costPrice = inputFields.costPrice;
    data.shippingCost = inputFields.shippingCost;
    data.marketplaceFee = inputFields.marketplaceFee;
    data.paymentFee = inputFields.paymentFee;
    data.taxRate = inputFields.taxRate;
    data.packagingCost = inputFields.packagingCost;
    data.returnCost = inputFields.returnCost;
    data.advertisingCost = inputFields.advertisingCost;
    data.otherCosts = inputFields.otherCosts;
    data.monthlyUnits = inputFields.monthlyUnits;

    const simulation = await db.profitSimulation.update({
      where: { id },
      data,
    });

    return NextResponse.json(simulation, { status: 200 });
  } catch (error) {
    console.error('Error updating profit simulation:', error);
    return NextResponse.json(
      { error: 'Failed to update profit simulation' },
      { status: 500 }
    );
  }
}

// DELETE /api/profit-simulator?id=xxx — Delete a simulation
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

    await db.profitSimulation.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Profit simulation deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting profit simulation:', error);
    return NextResponse.json(
      { error: 'Failed to delete profit simulation' },
      { status: 500 }
    );
  }
}
