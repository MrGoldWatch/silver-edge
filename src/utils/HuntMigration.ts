import { Hunt, DenominationEntry, HuntHelpers } from '../types/Hunt';

// Legacy hunt interface for migration
interface LegacyHunt {
  id: string;
  bankName: string;
  branchName?: string;
  branchAddress?: string;
  branchId?: string;
  date: string;
  denomination: 'Dimes' | 'Quarters' | 'Halves';
  numberOfRolls: number;
  coinsPerRoll: number;
  totalCoinsChecked: number;
  silverCoinsFound: number;
  isProcessed: boolean;
  lastUpdated?: string;
  notes?: string;
  processingNotes?: string;
}

export class HuntMigration {
  /**
   * Check if a hunt object is in the legacy format
   */
  static isLegacyHunt(hunt: any): hunt is LegacyHunt {
    return hunt && typeof hunt.denomination === 'string' && !hunt.denominations;
  }

  /**
   * Check if a hunt object is in the new format (includes API format)
   */
  static isNewHunt(hunt: any): hunt is Hunt {
    return hunt && Array.isArray(hunt.denominations);
  }

  /**
   * Migrate a legacy hunt to the new format
   */
  static migrateLegacyHunt(legacyHunt: LegacyHunt): Hunt {
    const denominationEntry: DenominationEntry = {
      denomination: legacyHunt.denomination,
      numberOfRolls: legacyHunt.numberOfRolls,
      coinsPerRoll: legacyHunt.coinsPerRoll,
      totalCoinsChecked: legacyHunt.totalCoinsChecked,
      silverCoinsFound: legacyHunt.silverCoinsFound,
      isProcessed: legacyHunt.isProcessed,
      processingNotes: legacyHunt.processingNotes,
    };

    const newHunt: Hunt = {
      id: legacyHunt.id,
      bankName: legacyHunt.bankName,
      branchName: legacyHunt.branchName,
      branchAddress: legacyHunt.branchAddress,
      branchId: legacyHunt.branchId,
      date: legacyHunt.date,
      denominations: [denominationEntry],
      isProcessed: legacyHunt.isProcessed,
      lastUpdated: legacyHunt.lastUpdated,
      notes: legacyHunt.notes,
      processingNotes: legacyHunt.processingNotes,
    };

    return newHunt;
  }

  /**
   * Migrate an array of hunts, handling both legacy and new formats
   */
  static migrateHunts(hunts: any[]): Hunt[] {
    return hunts.map(hunt => {
      if (this.isLegacyHunt(hunt)) {
        return this.migrateLegacyHunt(hunt);
      } else if (this.isNewHunt(hunt)) {
        return hunt;
      } else {
        console.warn('Unknown hunt format:', hunt);
        // Try to create a minimal valid hunt
        return {
          id: hunt.id || Date.now().toString(),
          bankName: hunt.bankName || 'Unknown Bank',
          date: hunt.date || new Date().toISOString(),
          denominations: [],
          isProcessed: false,
        };
      }
    });
  }

  /**
   * Create safe helper functions that work with both formats
   */
  static getSafeTotalCoinsChecked(hunt: any): number {
    if (this.isNewHunt(hunt)) {
      // Handle API format (has totalCoinsChecked property) or local format
      if (hunt.totalCoinsChecked !== undefined) {
        return hunt.totalCoinsChecked;
      }
      return HuntHelpers.getTotalCoinsChecked(hunt);
    } else if (this.isLegacyHunt(hunt)) {
      return hunt.totalCoinsChecked || 0;
    }
    return 0;
  }

  static getSafeTotalSilverFound(hunt: any): number {
    if (this.isNewHunt(hunt)) {
      // Handle API format (has totalSilverFound property) or local format
      if (hunt.totalSilverFound !== undefined) {
        return hunt.totalSilverFound;
      }
      return HuntHelpers.getTotalSilverFound(hunt);
    } else if (this.isLegacyHunt(hunt)) {
      return hunt.silverCoinsFound || 0;
    }
    return 0;
  }

  static getSafeIsProcessed(hunt: any): boolean {
    if (this.isNewHunt(hunt)) {
      // Handle API format (has isProcessed property) or local format
      if (hunt.isProcessed !== undefined) {
        return hunt.isProcessed;
      }
      return HuntHelpers.isFullyProcessed(hunt);
    } else if (this.isLegacyHunt(hunt)) {
      return hunt.isProcessed || false;
    }
    return false;
  }

  static getSafeDenominationSummary(hunt: any): string {
    if (this.isNewHunt(hunt)) {
      // Handle both local Hunt format and API Hunt format
      if (hunt.denominations && hunt.denominations.length > 0) {
        return hunt.denominations
          .map((denom: any) => `${denom.denomination} (${denom.numberOfRolls})`)
          .join(', ');
      }
      return 'No denominations';
    } else if (this.isLegacyHunt(hunt)) {
      return `${hunt.denomination} (${hunt.numberOfRolls})`;
    }
    return 'Unknown';
  }
}
