import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';

export class CircularDependencyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircularDependencyException';
  }
}

export interface BomResolvedItem {
  variantId: string;
  quantity: number;
}

@Injectable()
export class BomResolverService {
  private readonly logger = new Logger(BomResolverService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Resolves a bundle into its physical leaf components recursively.
   * Throws CircularDependencyException if a cycle is detected.
   *
   * @param bundleVariantId The ID of the parent bundle variant
   * @param multiplier The quantity of the bundle being sold (default: 1)
   * @param visited A Set to keep track of visited variants for cycle detection
   * @returns A map of physical variant IDs to their total quantities needed
   */
  async resolveBundle(
    bundleVariantId: string,
    multiplier = 1,
    visited = new Set<string>()
  ): Promise<Map<string, number>> {
    if (visited.has(bundleVariantId)) {
      this.logger.error(`Circular dependency detected involving variant ID: ${bundleVariantId}`);
      throw new CircularDependencyException(
        `Circular dependency detected! Variant ID: ${bundleVariantId} is included inside itself.`
      );
    }

    visited.add(bundleVariantId);
    const resolvedItems = new Map<string, number>();

    // Fetch the variant with its bundle components
    const variant = await this.databaseService.client.productVariant.findUnique({
      where: { id: bundleVariantId },
      include: {
        bundleItems: {
          include: {
            childVariant: true,
          },
        },
      },
    });

    if (!variant) {
      this.logger.warn(`Variant not found: ${bundleVariantId}`);
      return resolvedItems;
    }

    // If it's not a bundle, it's a physical item (leaf node)
    if (!variant.isBundle || variant.bundleItems.length === 0) {
      resolvedItems.set(bundleVariantId, multiplier);
      // Remove from visited so it can be used again in other branches if needed,
      // though typically sets shouldn't contain leaf nodes multiple times in the same path.
      visited.delete(bundleVariantId);
      return resolvedItems;
    }

    // Resolve all child components concurrently
    const childPromises = variant.bundleItems.map((component) => {
      const childQuantity = component.quantity * multiplier;

      // Recursively resolve child components
      return this.resolveBundle(
        component.childVariantId,
        childQuantity,
        new Set(visited) // Pass a copy of the visited set for this branch
      );
    });

    const results = await Promise.all(childPromises);

    // Merge the results
    for (const childResolved of results) {
      for (const [childId, childQty] of childResolved.entries()) {
        const currentQty = resolvedItems.get(childId) || 0;
        resolvedItems.set(childId, currentQty + childQty);
      }
    }

    return resolvedItems;
  }
}
