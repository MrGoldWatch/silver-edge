import { UserLocation } from './LocationService';

export interface BankBranch {
  id: string;
  name: string;
  bankName: string;
  address: string;
  distance: number; // in miles
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  isOpen?: boolean;
}

export class BankBranchService {
  // For demo purposes, we'll use mock data. In production, you'd use Google Places API
  private static mockBranches: Omit<BankBranch, 'distance'>[] = [
    {
      id: 'chase_001',
      name: 'Chase Bank - Main Street',
      bankName: 'Chase Bank',
      address: '123 Main St, Anytown, CA 90210',
      latitude: 37.7749,
      longitude: -122.4194,
      phoneNumber: '(555) 123-4567',
      isOpen: true,
    },
    {
      id: 'chase_002',
      name: 'Chase Bank - Downtown',
      bankName: 'Chase Bank',
      address: '456 Downtown Ave, Anytown, CA 90210',
      latitude: 37.7849,
      longitude: -122.4094,
      phoneNumber: '(555) 234-5678',
      isOpen: true,
    },
    {
      id: 'wellsfargo_001',
      name: 'Wells Fargo - Oak Street',
      bankName: 'Wells Fargo',
      address: '789 Oak St, Anytown, CA 90210',
      latitude: 37.7649,
      longitude: -122.4294,
      phoneNumber: '(555) 345-6789',
      isOpen: true,
    },
    {
      id: 'bofa_001',
      name: 'Bank of America - Pine Ave',
      bankName: 'Bank of America',
      address: '321 Pine Ave, Anytown, CA 90210',
      latitude: 37.7549,
      longitude: -122.4394,
      phoneNumber: '(555) 456-7890',
      isOpen: false,
    },
    {
      id: 'citibank_001',
      name: 'Citibank - Elm Street',
      bankName: 'Citibank',
      address: '654 Elm St, Anytown, CA 90210',
      latitude: 37.7949,
      longitude: -122.3994,
      phoneNumber: '(555) 567-8901',
      isOpen: true,
    },
  ];

  /**
   * Find nearby bank branches based on user location and selected bank
   */
  static async findNearbyBranches(
    userLocation: UserLocation,
    bankName: string,
    radiusMiles: number = 10
  ): Promise<BankBranch[]> {
    try {
      // Filter branches by bank name
      const filteredBranches = this.mockBranches.filter(branch =>
        branch.bankName.toLowerCase().includes(bankName.toLowerCase())
      );

      // Calculate distances and filter by radius
      const branchesWithDistance = filteredBranches
        .map(branch => ({
          ...branch,
          distance: this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            branch.latitude,
            branch.longitude
          ),
        }))
        .filter(branch => branch.distance <= radiusMiles)
        .sort((a, b) => a.distance - b.distance);

      return branchesWithDistance;
    } catch (error) {
      console.error('Error finding nearby branches:', error);
      return [];
    }
  }

  /**
   * Get all branches for a specific bank (fallback when location is not available)
   */
  static async getBranchesForBank(bankName: string): Promise<Omit<BankBranch, 'distance'>[]> {
    try {
      return this.mockBranches.filter(branch =>
        branch.bankName.toLowerCase().includes(bankName.toLowerCase())
      );
    } catch (error) {
      console.error('Error getting branches for bank:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two points in miles
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format branch display name with distance
   */
  static formatBranchDisplay(branch: BankBranch): string {
    const distanceStr = branch.distance < 1 
      ? `${(branch.distance * 5280).toFixed(0)} ft`
      : `${branch.distance.toFixed(1)} mi`;
    
    const statusIcon = branch.isOpen ? '🟢' : '🔴';
    
    return `${statusIcon} ${branch.name} (${distanceStr})`;
  }
}
