import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Hunt, HuntHelpers, DenominationEntry } from '../types/Hunt';
import { HuntMigration } from '../utils/HuntMigration';
import { HuntStorage } from '../services/HuntStorage';

interface HuntEditModalProps {
  visible: boolean;
  hunt: Hunt | null;
  onClose: () => void;
  onSave: (updatedHunt: Hunt) => void;
}

export const HuntEditModal: React.FC<HuntEditModalProps> = ({
  visible,
  hunt,
  onClose,
  onSave,
}) => {
  const [denominationData, setDenominationData] = useState<{[key: string]: {silverCount: string}}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hunt) {
      const data: {[key: string]: {silverCount: string}} = {};

      // Handle both legacy and new hunt formats
      if (HuntMigration.isNewHunt(hunt)) {
        hunt.denominations.forEach((denom) => {
          data[denom.denomination] = {
            silverCount: denom.silverCoinsFound.toString(),
          };
        });
      } else if (HuntMigration.isLegacyHunt(hunt)) {
        // Convert legacy hunt for editing
        data[hunt.denomination] = {
          silverCount: hunt.silverCoinsFound.toString(),
        };
      }

      setDenominationData(data);
    }
  }, [hunt]);

  const handleSave = async () => {
    if (!hunt) return;

    // Validate all silver counts
    for (const [denomination, data] of Object.entries(denominationData)) {
      const silverCount = parseInt(data.silverCount);
      if (isNaN(silverCount) || silverCount < 0) {
        Alert.alert('Error', `Please enter a valid number of silver coins for ${denomination}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      // Update each denomination
      const updatedDenominations: DenominationEntry[] = hunt.denominations.map(denom => {
        const data = denominationData[denom.denomination];
        if (data) {
          return {
            ...denom,
            silverCoinsFound: parseInt(data.silverCount),
            isProcessed: true,
          };
        }
        return denom;
      });

      const updatedHunt: Hunt = {
        ...hunt,
        denominations: updatedDenominations,
        isProcessed: HuntHelpers.isFullyProcessed({ denominations: updatedDenominations } as Hunt),
        lastUpdated: new Date().toISOString(),
      };

      // Save to storage
      await HuntStorage.updateHunt(updatedHunt);

      onSave(updatedHunt);
      Alert.alert('Success', 'Hunt updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating hunt:', error);
      Alert.alert('Error', 'Failed to update hunt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hunt) {
      const data: {[key: string]: {silverCount: string}} = {};
      hunt.denominations.forEach((denom) => {
        data[denom.denomination] = {
          silverCount: denom.silverCoinsFound.toString(),
        };
      });
      setDenominationData(data);
    }
    onClose();
  };

  if (!hunt) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Hunt</Text>
          <TouchableOpacity
            onPress={handleSave}
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
          alwaysBounceVertical={true}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
        >
          <View style={styles.huntInfo}>
            <Text style={styles.huntInfoTitle}>Hunt Details</Text>
            <Text style={styles.huntInfoText}>
              🏦 {hunt.branchName || hunt.bankName}
            </Text>
            {hunt.branchAddress && (
              <Text style={styles.huntInfoSubtext}>📍 {hunt.branchAddress}</Text>
            )}
            <Text style={styles.huntInfoText}>
              📅 {new Date(hunt.date).toLocaleDateString()}
            </Text>
            <Text style={styles.huntInfoText}>
              🪙 {HuntMigration.getSafeDenominationSummary(hunt)}
            </Text>
            <Text style={styles.huntInfoText}>
              Total: {HuntMigration.getSafeTotalCoinsChecked(hunt)} coins • {HuntMigration.getSafeTotalSilverFound(hunt)} silver
            </Text>
            <Text style={styles.huntInfoText}>
              Status: {HuntMigration.getSafeIsProcessed(hunt) ? '✅ Processed' : '⏳ Unprocessed'}
            </Text>
          </View>

          {(HuntMigration.isNewHunt(hunt) ? hunt.denominations : HuntMigration.isLegacyHunt(hunt) ? [HuntMigration.migrateLegacyHunt(hunt).denominations[0]] : []).map((denom, index) => (
            <View key={denom.denomination} style={styles.editSection}>
              <Text style={styles.sectionTitle}>
                {denom.denomination} ({denom.numberOfRolls} rolls, {denom.totalCoinsChecked} coins)
              </Text>
              <Text style={styles.helpText}>
                Update silver coins found and add notes for this denomination
              </Text>

              <View style={styles.denominationInputs}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Silver Coins Found</Text>
                  <TextInput
                    style={styles.input}
                    value={denominationData[denom.denomination]?.silverCount || ''}
                    onChangeText={(value) => setDenominationData(prev => ({
                      ...prev,
                      [denom.denomination]: {
                        silverCount: value,
                      }
                    }))}
                    placeholder="Number of silver coins"
                    keyboardType="numeric"
                    selectTextOnFocus
                  />
                </View>
              </View>


            </View>
          ))}



          {hunt.lastUpdated && (
            <View style={styles.lastUpdatedSection}>
              <Text style={styles.lastUpdatedText}>
                Last updated: {new Date(hunt.lastUpdated).toLocaleString()}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 300,
    flexGrow: 1,
  },
  huntInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  huntInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  huntInfoText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  huntInfoSubtext: {
    fontSize: 12,
    marginBottom: 6,
    color: '#666',
    fontStyle: 'italic',
  },
  editSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  notesInput: {
    height: 100,
  },
  denominationInputs: {
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  lastUpdatedSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
