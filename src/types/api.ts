// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Hunt Types (matching backend schema)
export interface HuntDenomination {
  id?: string;
  denomination: 'Dimes' | 'Quarters' | 'Halves';
  numberOfRolls: number;
  coinsPerRoll: number;
  totalCoinsChecked: number;
  silverCoinsFound: number;
  isProcessed: boolean;
  processingNotes?: string;
  createdAt?: string;
}

export interface Hunt {
  id?: string;
  userId?: string;
  bankName: string;
  branchName?: string;
  branchAddress?: string;
  latitude?: number;
  longitude?: number;
  huntDate: string; // ISO date string
  totalRolls: number;
  totalCoinsChecked: number;
  totalSilverFound: number;
  isProcessed: boolean;
  processingNotes?: string;
  denominations: HuntDenomination[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHuntRequest {
  bankName: string;
  branchName?: string;
  branchAddress?: string;
  latitude?: number;
  longitude?: number;
  huntDate: string;
  denominations: Omit<HuntDenomination, 'id' | 'createdAt' | 'totalCoinsChecked'>[];
  processingNotes?: string;
}

export interface UpdateHuntRequest extends Partial<CreateHuntRequest> {
  id: string;
}

// Statistics Types
export interface UserStats {
  timeframe: 'all' | 'week' | 'month';
  summary: {
    totalHunts: number;
    totalRolls: number;
    totalCoinsChecked: number;
    totalSilverFound: number;
    successRate: number;
  };
  bankStats: Record<string, {
    hunts: number;
    totalSilver: number;
    totalCoins: number;
  }>;
  denominationStats: Record<string, {
    rolls: number;
    coinsChecked: number;
    silverFound: number;
  }>;
}

// API Error Types
export interface ApiError {
  error: string;
  message?: string;
  details?: any;
  status?: number;
}

// Network Types
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
}

// Sync Types
export interface SyncStatus {
  lastSync?: string;
  pendingChanges: number;
  isSyncing: boolean;
  syncErrors: string[];
}

export interface SyncConflict {
  localItem: Hunt;
  remoteItem: Hunt;
  conflictType: 'update' | 'delete' | 'create';
  resolution?: 'local' | 'remote' | 'merge';
}
