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
  branchNumber?: string; // For Wells Fargo branch numbers
  latitude?: number;
  longitude?: number;
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
  const [showWellsFargoBranchInput, setShowWellsFargoBranchInput] = useState(false);
  const [wellsFargoBranchNumber, setWellsFargoBranchNumber] = useState('');
  const inputRef = useRef<TextInput>(null);
  const branchNumberInputRef = useRef<TextInput>(null);

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

    // Special handling for Wells Fargo - show branch number input
    if (bank === 'Wells Fargo') {
      setShowWellsFargoBranchInput(true);
      setShowBranches(false);
      onDropdownStateChange?.(true);
      return;
    }

    // Load nearby branches for other banks
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
          inputRef.current?.blur(); // Only blur if no branches to show
        }
      } catch (error) {
        console.error('Error loading branches:', error);
        onDropdownStateChange?.(false);
        inputRef.current?.blur(); // Only blur on error
      } finally {
        setIsLoadingBranches(false);
      }
    } else {
      onDropdownStateChange?.(false);
      inputRef.current?.blur(); // Only blur if no location
    }
  };

  const selectBranch = (branch: BankBranch) => {
    const selection: BankSelection = {
      bankName: branch.bankName,
      branchName: branch.name,
      branchAddress: branch.address,
      branchId: branch.id,
      branchNumber: branch.branchNumber,
      latitude: branch.latitude,
      longitude: branch.longitude,
    };

    onChangeText(`${branch.bankName} - ${branch.name}`);
    onBranchSelect?.(selection);
    setShowBranches(false);
    setShowSuggestions(false);
    inputRef.current?.blur(); // Remove focus from input
    onDropdownStateChange?.(false);
  };

  const handleWellsFargoBranchNumberChange = (branchNumber: string) => {
    // Only allow 4 digits
    const cleanNumber = branchNumber.replace(/\D/g, '').slice(0, 4);
    setWellsFargoBranchNumber(cleanNumber);
  };

  const selectWellsFargoBranch = () => {
    if (!BankBranchService.isValidWellsFargoBranchNumber(wellsFargoBranchNumber)) {
      Alert.alert('Invalid Branch Number', 'Please enter a valid 4-digit Wells Fargo branch number.');
      return;
    }

    const branch = BankBranchService.getWellsFargoBranchByNumber(wellsFargoBranchNumber);
    if (!branch) {
      Alert.alert('Branch Not Found', 'The entered branch number was not found in our database.');
      return;
    }

    const selection: BankSelection = {
      bankName: 'Wells Fargo',
      branchName: branch.name,
      branchAddress: branch.address,
      branchId: branch.id,
      branchNumber: wellsFargoBranchNumber,
      latitude: branch.latitude,
      longitude: branch.longitude,
    };

    onChangeText(`Wells Fargo - Branch #${wellsFargoBranchNumber}`);
    onBranchSelect?.(selection);
    setShowWellsFargoBranchInput(false);
    setShowSuggestions(false);
    inputRef.current?.blur();
    branchNumberInputRef.current?.blur();
    onDropdownStateChange?.(false);
  };

  const dismissDropdowns = () => {
    setShowSuggestions(false);
    setShowBranches(false);
    setShowWellsFargoBranchInput(false);
    inputRef.current?.blur();
    branchNumberInputRef.current?.blur();
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

      {/* Wells Fargo branch number input */}
      {showWellsFargoBranchInput && (
        <View style={styles.wellsFargoBranchInput}>
          <Text style={styles.branchInputHeader}>🏦 Enter Wells Fargo Branch Number</Text>
          <View style={styles.branchInputContainer}>
            <TextInput
              ref={branchNumberInputRef}
              style={styles.branchNumberInput}
              value={wellsFargoBranchNumber}
              onChangeText={handleWellsFargoBranchNumberChange}
              placeholder="Enter 4-digit branch number (e.g., 1001)"
              keyboardType="numeric"
              maxLength={4}
              autoFocus={true}
            />
            <TouchableOpacity
              style={[
                styles.selectBranchButton,
                wellsFargoBranchNumber.length === 4 ? styles.selectBranchButtonEnabled : styles.selectBranchButtonDisabled
              ]}
              onPress={selectWellsFargoBranch}
              disabled={wellsFargoBranchNumber.length !== 4}
            >
              <Text style={[
                styles.selectBranchButtonText,
                wellsFargoBranchNumber.length === 4 ? styles.selectBranchButtonTextEnabled : styles.selectBranchButtonTextDisabled
              ]}>
                Select
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.branchInputHint}>
            Common branch numbers: {BankBranchService.getAvailableWellsFargoBranchNumbers().slice(0, 5).join(', ')}...
          </Text>
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
  wellsFargoBranchInput: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  branchInputHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  branchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  branchNumberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 8,
    textAlign: 'center',
  },
  selectBranchButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  selectBranchButtonEnabled: {
    backgroundColor: '#007AFF',
  },
  selectBranchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  selectBranchButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectBranchButtonTextEnabled: {
    color: '#fff',
  },
  selectBranchButtonTextDisabled: {
    color: '#999',
  },
  branchInputHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
