import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LocationService, UserLocation } from '../services/LocationService';
import { BankBranchService, BankBranch } from '../services/BankBranchService';

// Simple bank database
const BANKS = [
  'Chase Bank',
  'Wells Fargo',
  'Bank of America',
  'Citibank',
  'US Bank',
  'PNC Bank',
  'Capital One',
  'TD Bank',
  'Regions Bank',
  'Fifth Third Bank'
];

export interface BankSelection {
  bankName: string;
  branchName?: string;
  branchAddress?: string;
  branchId?: string;
}

interface BankPickerProps {
  value: string;
  onChangeText: (text: string) => void;
  onBranchSelect?: (selection: BankSelection) => void;
  onDropdownStateChange?: (isOpen: boolean) => void;
  onDismiss?: () => void;
}

export interface BankPickerRef {
  dismissDropdowns: () => void;
}

export const BankPicker = forwardRef<BankPickerRef, BankPickerProps>(({ value, onChangeText, onBranchSelect, onDropdownStateChange }, ref) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredBanks, setFilteredBanks] = useState<string[]>([]);
  const [nearbyBranches, setNearbyBranches] = useState<BankBranch[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await LocationService.getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    setShowBranches(false);
    setFilteredBanks(BANKS.slice(0, 8)); // Show more banks but limit with scrolling
    onDropdownStateChange?.(true);
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    setShowBranches(false);
    if (text.length >= 2) {
      const filtered = BANKS.filter(bank =>
        bank.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBanks(filtered.slice(0, 8)); // Show more results but limit with scrolling
    } else {
      setFilteredBanks(BANKS.slice(0, 8));
    }
  };

  const selectBank = async (bank: string) => {
    onChangeText(bank);
    setShowSuggestions(false);
    inputRef.current?.blur(); // Remove focus from input

    // Load nearby branches for selected bank
    if (userLocation) {
      setIsLoadingBranches(true);
      try {
        const branches = await BankBranchService.findNearbyBranches(userLocation, bank);
        setNearbyBranches(branches);
        if (branches.length > 0) {
          setShowBranches(true);
          onDropdownStateChange?.(true);
        } else {
          onDropdownStateChange?.(false);
        }
      } catch (error) {
        console.error('Error loading branches:', error);
        onDropdownStateChange?.(false);
      } finally {
        setIsLoadingBranches(false);
      }
    } else {
      onDropdownStateChange?.(false);
    }
  };

  const selectBranch = (branch: BankBranch) => {
    const selection: BankSelection = {
      bankName: branch.bankName,
      branchName: branch.name,
      branchAddress: branch.address,
      branchId: branch.id,
    };

    onChangeText(`${branch.bankName} - ${branch.name}`);
    onBranchSelect?.(selection);
    setShowBranches(false);
    setShowSuggestions(false);
    inputRef.current?.blur(); // Remove focus from input
    onDropdownStateChange?.(false);
  };

  const dismissDropdowns = () => {
    setShowSuggestions(false);
    setShowBranches(false);
    inputRef.current?.blur();
    onDropdownStateChange?.(false);
  };

  useImperativeHandle(ref, () => ({
    dismissDropdowns,
  }));

  return (
    <View style={styles.bankPickerContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => {
            dismissDropdowns();
          }, 150)}
          placeholder="Enter bank name or select from suggestions"
        />
        {isLoadingLocation && (
          <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIndicator} />
        )}
      </View>

      {isLoadingBranches && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Finding nearby branches...</Text>
        </View>
      )}

      {showBranches && nearbyBranches.length === 0 && !isLoadingBranches && (
        <View style={styles.noBranchesContainer}>
          <Text style={styles.noBranchesText}>No nearby branches found</Text>
        </View>
      )}

      {/* Bank suggestions dropdown */}
      {showSuggestions && (
        <View style={styles.suggestions}>
          <ScrollView
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {filteredBanks.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.suggestionItem}
                onPress={() => selectBank(item)}
              >
                <Text style={styles.suggestionText}>🏦 {item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Branch suggestions dropdown */}
      {showBranches && nearbyBranches.length > 0 && (
        <View style={styles.branchSuggestions}>
          <Text style={styles.branchHeader}>📍 Nearby Branches</Text>
          <ScrollView
            style={styles.branchList}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {nearbyBranches.slice(0, 5).map((branch) => (
              <TouchableOpacity
                key={branch.id}
                style={styles.branchItem}
                onPress={() => selectBranch(branch)}
              >
                <Text style={styles.branchName}>
                  {BankBranchService.formatBranchDisplay(branch)}
                </Text>
                <Text style={styles.branchAddress}>{branch.address}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  bankPickerContainer: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loadingIndicator: {
    marginLeft: 8,
  },

  suggestions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    maxHeight: 200, // Fixed height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  suggestionsList: {
    maxHeight: 200, // Ensure scrolling
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  branchSuggestions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    maxHeight: 280, // Fixed height for branches
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  branchList: {
    maxHeight: 220, // Scrollable area for branches
  },
  branchHeader: {
    padding: 12,
    backgroundColor: '#f0f8ff',
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  branchItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  branchName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  branchAddress: {
    fontSize: 13,
    color: '#666',
  },
  noBranchesContainer: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  noBranchesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
