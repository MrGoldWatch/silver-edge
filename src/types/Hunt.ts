export interface DenominationEntry {
  denomination: 'Dimes' | 'Quarters' | 'Halves';
  numberOfRolls: number;
  coinsPerRoll: number;
  totalCoinsChecked: number; // calculated: rolls * coinsPerRoll
  silverCoinsFound: number;
  isProcessed: boolean; // true if this denomination has been examined
  processingNotes?: string; // notes specific to this denomination
}

export interface Hunt {
  id: string;
  bankName: string;
  branchName?: string;
  branchAddress?: string;
  branchId?: string;
  date: string; // ISO date string
  denominations: DenominationEntry[]; // Array of denomination entries
  isProcessed: boolean; // true if all denominations have been examined
  lastUpdated?: string; // ISO date string of last edit
  notes?: string;
  processingNotes?: string; // general notes added during processing
}

export interface HuntEditHistory {
  huntId: string;
  editDate: string;
  denomination: 'Dimes' | 'Quarters' | 'Halves';
  previousSilverCount: number;
  newSilverCount: number;
  editNotes?: string;
}

export const DENOMINATION_DEFAULTS = {
  Dimes: 50,
  Quarters: 40,
  Halves: 20,
} as const;

export type Denomination = keyof typeof DENOMINATION_DEFAULTS;

// Helper functions for working with multi-denomination hunts
export const HuntHelpers = {
  // Get total coins checked across all denominations
  getTotalCoinsChecked: (hunt: Hunt): number => {
    if (!hunt.denominations || hunt.denominations.length === 0) return 0;
    return hunt.denominations.reduce((total, denom) => total + denom.totalCoinsChecked, 0);
  },

  // Get total silver found across all denominations
  getTotalSilverFound: (hunt: Hunt): number => {
    if (!hunt.denominations || hunt.denominations.length === 0) return 0;
    return hunt.denominations.reduce((total, denom) => total + denom.silverCoinsFound, 0);
  },

  // Check if hunt is fully processed (all denominations processed)
  isFullyProcessed: (hunt: Hunt): boolean => {
    if (!hunt.denominations || hunt.denominations.length === 0) return false;
    return hunt.denominations.every(denom => denom.isProcessed);
  },

  // Get summary string for hunt (e.g., "Dimes (5), Quarters (3)")
  getDenominationSummary: (hunt: Hunt): string => {
    if (!hunt.denominations || hunt.denominations.length === 0) return 'No denominations';
    return hunt.denominations
      .map(denom => `${denom.denomination} (${denom.numberOfRolls})`)
      .join(', ');
  },

  // Create a new denomination entry
  createDenominationEntry: (
    denomination: Denomination,
    numberOfRolls: number,
    silverCoinsFound: number = 0
  ): DenominationEntry => {
    const coinsPerRoll = DENOMINATION_DEFAULTS[denomination];
    return {
      denomination,
      numberOfRolls,
      coinsPerRoll,
      totalCoinsChecked: numberOfRolls * coinsPerRoll,
      silverCoinsFound,
      isProcessed: silverCoinsFound > 0,
      processingNotes: '',
    };
  },
};