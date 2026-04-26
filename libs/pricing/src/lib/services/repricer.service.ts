import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { CoreQueueService, JobTypes } from '@omnicore/queue-management';
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

@Injectable()
export class RepricerService {
  private readonly logger = new Logger(RepricerService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly queueService: CoreQueueService,
  ) {}

  /**
   * Calculates the secure price based on the Net Profit Shield algorithm
   * Works on ProductVariant since that's where price and cost live.
   */
  public async calculateSecurePrice(
    variantId: string,
    proposedPrice: number,
    minMarginPct: number,
    marketplace: string
  ): Promise<{ finalPrice: number; isShielded: boolean; estimatedProfitPct: number }> {
    const variant = await this.db.client.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new Error(`Variant not found: ${variantId}`);
    }

    // Convert inputs to Decimal for safe financial math
    const baseCost = new Decimal(variant.movingAverageCost?.toString() || '0');

    // In a real system, these would come from the marketplace adapter or product settings
    const commissionPct = new Decimal('15'); // Assume 15% commission
    const shippingCost = new Decimal('35'); // Assume 35 TL fixed shipping or calculated from desi

    const propPrice = new Decimal(proposedPrice);

    // Profit = ProposedPrice - (Cost + Commission + Shipping)
    // Commission = ProposedPrice * (CommissionPct / 100)
    const commissionAmount = propPrice.mul(commissionPct).div(100);
    const totalCost = baseCost.add(commissionAmount).add(shippingCost);

    const netProfit = propPrice.sub(totalCost);

    // If cost is 0, margin is infinite, otherwise calculate normally
    const marginPct = baseCost.isZero() ? new Decimal('100') : netProfit.div(baseCost).mul(100);

    const minMarginDec = new Decimal(minMarginPct);

    let finalPrice = propPrice;
    let isShielded = false;

    // NET PROFIT SHIELD
    if (marginPct.lt(minMarginDec)) {
      isShielded = true;
      this.logger.warn(`Net Profit Shield activated for variant ${variantId}. Proposed margin: ${marginPct.toFixed(2)}% < Minimum: ${minMarginDec.toFixed(2)}%`);

      // Calculate the minimum allowable price to hit the minMarginPct
      const desiredProfit = baseCost.mul(minMarginDec).div(100);
      const rhs = baseCost.add(shippingCost).add(desiredProfit);
      const lhsCoefficient = new Decimal('1').sub(commissionPct.div(100));

      finalPrice = rhs.div(lhsCoefficient);
    }

    // Rounding to nearest .90 or .99 could be added here depending on rules
    finalPrice = finalPrice.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const finalCommission = finalPrice.mul(commissionPct).div(100);
    const finalTotalCost = baseCost.add(finalCommission).add(shippingCost);
    const finalNetProfit = finalPrice.sub(finalTotalCost);
    const finalMarginPct = baseCost.isZero() ? new Decimal('100') : finalNetProfit.div(baseCost).mul(100);

    return {
      finalPrice: finalPrice.toNumber(),
      isShielded,
      estimatedProfitPct: finalMarginPct.toNumber()
    };
  }

  /**
   * Evaluates a rule and queues the price update if necessary
   */
  public async evaluateRuleForVariant(ruleId: string, variantId: string, competitorPrice: number) {
    const rule = await this.db.client.repricerRule.findUnique({
      where: { id: ruleId }
    });

    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    // Basic strategy calculation (Match Lowest)
    let proposedPrice = competitorPrice;
    if (rule.strategy === 'beat_by') {
      if (rule.beatByType === 'fixed') {
        proposedPrice = new Decimal(competitorPrice).sub(rule.beatBy).toNumber();
      } else {
        const beatAmount = new Decimal(competitorPrice).mul(rule.beatBy).div(100);
        proposedPrice = new Decimal(competitorPrice).sub(beatAmount).toNumber();
      }
    }

    // Apply Net Profit Shield
    const { finalPrice, isShielded } = await this.calculateSecurePrice(
      variantId,
      proposedPrice,
      rule.minMargin,
      rule.marketplace
    );

    // Queue the update instead of doing it synchronously
    const jobId = `price_update_${variantId}_${Date.now()}`;
    await this.queueService.addSyncJob(
      JobTypes.SYNC_PRODUCT,
      {
        variantId,
        newPrice: finalPrice,
        marketplace: rule.marketplace,
        ruleId: rule.id,
        reason: isShielded ? 'shield_activated' : 'rule_match'
      },
      jobId
    );

    this.logger.log(`Queued price update for variant ${variantId}. New: ${finalPrice}, Shielded: ${isShielded}`);
  }
}
