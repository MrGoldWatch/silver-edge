import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from 'react-native';
import { Hunt, DENOMINATION_DEFAULTS, Denomination, DenominationEntry, HuntHelpers } from '../types/Hunt';
import { HuntStorage } from '../services/HuntStorage';
import { BankPicker, BankSelection, BankPickerRef } from './BankPicker';

interface HuntFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (hunt: Hunt) => void;
}

interface DenominationFormEntry {
  denomination: Denomination;
  numberOfRolls: string;
  silverFound: string;
}

export const HuntFormModal: React.FC<HuntFormModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [bankName, setBankName] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<BankSelection | null>(null);
  const [huntDate, setHuntDate] = useState<Date>(new Date());
  const [denominationEntries, setDenominationEntries] = useState<DenominationFormEntry[]>([
    { denomination: 'Dimes', numberOfRolls: '', silverFound: '' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const bankPickerRef = useRef<BankPickerRef>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSilverBreakdown, setShowSilverBreakdown] = useState(false);

  const addDenominationEntry = () => {
    const availableDenominations = Object.keys(DENOMINATION_DEFAULTS) as Denomination[];
    const usedDenominations = denominationEntries.map(entry => entry.denomination);
    const nextDenomination = availableDenominations.find(denom => !usedDenominations.includes(denom));

    if (nextDenomination) {
      setDenominationEntries([...denominationEntries, {
        denomination: nextDenomination,
        numberOfRolls: '',
        silverFound: ''
      }]);
    }
  };

  const removeDenominationEntry = (index: number) => {
    if (denominationEntries.length > 1) {
      setDenominationEntries(denominationEntries.filter((_, i) => i !== index));
    }
  };

  const updateDenominationEntry = (index: number, field: keyof DenominationFormEntry, value: string) => {
    const updated = [...denominationEntries];
    updated[index] = { ...updated[index], [field]: value };
    setDenominationEntries(updated);
  };

  const getTotalCoins = (): number => {
    return denominationEntries.reduce((total, entry) => {
      const rolls = parseInt(entry.numberOfRolls) || 0;
      const coinsPerRoll = DENOMINATION_DEFAULTS[entry.denomination];
      return total + (rolls * coinsPerRoll);
    }, 0);
  };

  const getTotalSilver = (): number => {
    return denominationEntries.reduce((total, entry) => {
      return total + (parseInt(entry.silverFound) || 0);
    }, 0);
  };

  const resetForm = () => {
    setBankName('');
    setSelectedBranch(null);
    setHuntDate(new Date());
    setDenominationEntries([{ denomination: 'Dimes', numberOfRolls: '', silverFound: '' }]);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const saveHunt = async () => {
    // Validate that we have bank name and at least one denomination with rolls
    if (!bankName) {
      Alert.alert('Error', 'Please enter a bank name');
      return;
    }

    const validEntries = denominationEntries.filter(entry => entry.numberOfRolls && parseInt(entry.numberOfRolls) > 0);
    if (validEntries.length === 0) {
      Alert.alert('Error', 'Please enter at least one denomination with number of rolls');
      return;
    }

    // Create denomination entries for the hunt
    const denominations: DenominationEntry[] = validEntries.map(entry =>
      HuntHelpers.createDenominationEntry(
        entry.denomination,
        parseInt(entry.numberOfRolls),
        parseInt(entry.silverFound) || 0
      )
    );

    const hunt: Hunt = {
      id: Date.now().toString(),
      bankName: selectedBranch?.bankName || bankName,
      branchName: selectedBranch?.branchName,
      branchAddress: selectedBranch?.branchAddress,
      branchId: selectedBranch?.branchId,
      date: huntDate.toISOString(),
      denominations,
      isProcessed: HuntHelpers.isFullyProcessed({ denominations } as Hunt),
    };

    setIsLoading(true);
    try {
      await HuntStorage.saveHunt(hunt);
      onSave(hunt);
      Alert.alert('Success', 'Hunt saved successfully!');
      resetForm();
    } catch (error) {
      console.error('Error saving hunt:', error);
      Alert.alert('Error', 'Failed to save hunt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    if (isDropdownOpen) {
      bankPickerRef.current?.dismissDropdowns();
      setIsDropdownOpen(false);
    }
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add New Hunt</Text>
          <TouchableOpacity
            onPress={saveHunt}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          scrollEnabled={true}
          onScrollBeginDrag={handleDismiss}
        >
          <View style={styles.formSection}>
                <Text style={styles.label}>Bank Name *</Text>
              <BankPicker
                ref={bankPickerRef}
                value={bankName}
                onChangeText={setBankName}
                onBranchSelect={setSelectedBranch}
                onDropdownStateChange={setIsDropdownOpen}
              />

              {selectedBranch && (
                <View style={styles.branchInfo}>
                  <Text style={styles.branchInfoText}>
                    📍 {selectedBranch.branchName}
                  </Text>
                  <Text style={styles.branchAddressText}>
                    {selectedBranch.branchAddress}
                  </Text>
                </View>
              )}

              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  Alert.prompt(
                    'Set Hunt Date',
                    'Enter date (YYYY-MM-DD)',
                    (text) => {
                      if (text) {
                        const date = new Date(text);
                        if (!isNaN(date.getTime())) {
                          setHuntDate(date);
                        } else {
                          Alert.alert('Error', 'Invalid date format. Please use YYYY-MM-DD');
                        }
                      }
                    },
                    'plain-text',
                    huntDate.toISOString().split('T')[0]
                  );
                }}
              >
                <Text style={styles.dateButtonText}>
                  📅 {huntDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <View style={styles.denominationsHeader}>
                <Text style={styles.label}>Denominations</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addDenominationEntry}
                  disabled={denominationEntries.length >= 3}
                >
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {denominationEntries.map((entry, index) => (
                <View key={index} style={styles.denominationEntry}>
                  <View style={styles.denominationHeader}>
                    <Text style={styles.denominationTitle}>
                      {entry.denomination} ({DENOMINATION_DEFAULTS[entry.denomination]} coins/roll)
                    </Text>
                    {denominationEntries.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeDenominationEntry(index)}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.denominationSelector}>
                    <View style={styles.denominationButtons}>
                      {Object.keys(DENOMINATION_DEFAULTS).map((denom) => (
                        <TouchableOpacity
                          key={denom}
                          style={[
                            styles.denominationButton,
                            entry.denomination === denom && styles.denominationButtonActive
                          ]}
                          onPress={() => updateDenominationEntry(index, 'denomination', denom)}
                        >
                          <Text style={[
                            styles.denominationText,
                            entry.denomination === denom && styles.denominationTextActive
                          ]}>
                            {denom}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.rollsRow}>
                    <Text style={styles.subLabel}>Number of Rolls *</Text>
                    <TextInput
                      style={styles.inlineInput}
                      value={entry.numberOfRolls}
                      onChangeText={(value) => updateDenominationEntry(index, 'numberOfRolls', value)}
                      placeholder="Enter number of rolls"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.coinsRow}>
                    <Text style={styles.subLabel}>Silver Coins Found</Text>
                    <TextInput
                      style={styles.inlineInput}
                      value={entry.silverFound}
                      onChangeText={(value) => updateDenominationEntry(index, 'silverFound', value)}
                      placeholder="Enter silver coins found"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))}

              <View style={styles.totalsSection}>
                <Text style={styles.totalLabel}>Total Coins: {getTotalCoins()}</Text>
                <TouchableOpacity
                  style={styles.silverBreakdownButton}
                  onPress={() => setShowSilverBreakdown(!showSilverBreakdown)}
                >
                  <Text style={styles.totalLabel}>
                    Total Silver Found: {getTotalSilver()} {showSilverBreakdown ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                {showSilverBreakdown && (
                  <View style={styles.silverBreakdown}>
                    {denominationEntries.map((entry, index) => {
                      const silverCount = parseInt(entry.silverFound) || 0;
                      if (silverCount > 0) {
                        return (
                          <Text key={index} style={styles.silverBreakdownItem}>
                            • {entry.denomination}: {silverCount} silver
                          </Text>
                        );
                      }
                      return null;
                    })}
                    {getTotalSilver() === 0 && (
                      <Text style={styles.silverBreakdownItem}>• No silver found yet</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 800,
    flexGrow: 1,
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 12,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  branchInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  branchInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  branchAddressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  denominationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  denominationButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  denominationButtonActive: {
    backgroundColor: '#007AFF',
  },
  denominationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  denominationTextActive: {
    color: '#fff',
  },
  coinsPerRoll: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dateButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  denominationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  denominationEntry: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  denominationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  denominationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#6c757d',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  denominationSelector: {
    marginBottom: 12,
  },
  denominationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rollsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  inlineInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    width: 120,
    marginLeft: 12,
  },
  totalsSection: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  silverBreakdownButton: {
    marginBottom: 4,
  },
  silverBreakdown: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#d4edda',
  },
  silverBreakdownItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
    paddingLeft: 8,
  },
});
