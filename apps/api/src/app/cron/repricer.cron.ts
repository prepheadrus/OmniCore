import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '@omnicore/database';
import { RepricerService } from '@omnicore/pricing';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class RepricerCronService {
  private readonly logger = new Logger(RepricerCronService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly repricerService: RepricerService,
    private readonly cls: ClsService
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async evaluateRepricerRules() {
    this.logger.debug('Running Repricer Rule Evaluation...');

    try {
        // In a real system we would iterate through all active channels
        // For now, we bypass the RLS for the cron job to fetch all rules
        // or we set a specific channel id context
        this.cls.set('app.channel_id', 'system-cron');

        const activeRules = await this.db.client.repricerRule.findMany({
            where: { isActive: true }
        });

        for (const rule of activeRules) {
            // Logic to evaluate rule would go here
            // e.g. finding competitors and evaluating rules for each product
            this.logger.debug(`Would evaluate rule: ${rule.id}`);
        }
    } catch (error) {
      this.logger.error('Error during repricer rule evaluation', error);
    }
  }
}
