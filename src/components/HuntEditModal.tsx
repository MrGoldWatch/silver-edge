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
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Hunt, UpdateHuntRequest } from '../types/api';
import apiService from '../services/api';
import { HuntStorage } from '../services/HuntStorage';
import { Hunt as LocalHunt } from '../types/Hunt';
import { HuntMigration } from '../utils/HuntMigration';

interface HuntEditModalProps {
  visible: boolean;
  hunt: Hunt | null;
  onClose: () => void;
  onHuntSaved: () => void;
  onHuntDeleted: () => void;
}

export const HuntEditModal: React.FC<HuntEditModalProps> = ({
  visible,
  hunt,
  onClose,
  onHuntSaved,
  onHuntDeleted,
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
      // Update each denomination with new silver counts
      const updatedDenominations = hunt.denominations.map(denom => {
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

      const updateRequest: UpdateHuntRequest = {
        id: hunt.id!,
        bankName: hunt.bankName,
        branchName: hunt.branchName,
        branchAddress: hunt.branchAddress,
        branchNumber: hunt.branchNumber,
        huntDate: hunt.huntDate.split('T')[0], // Format as YYYY-MM-DD
        denominations: updatedDenominations.map(denom => ({
          denomination: denom.denomination,
          numberOfRolls: denom.numberOfRolls,
          coinsPerRoll: denom.coinsPerRoll,
          silverCoinsFound: denom.silverCoinsFound,
          isProcessed: denom.isProcessed,
          processingNotes: denom.processingNotes,
        })),
      };

      // v2.0.0: Update via API for synchronization
      console.log('Updating hunt via API...', updateRequest);
      const updatedHunt = await apiService.updateHunt(hunt.id!, updateRequest);
      console.log('Hunt updated via API:', updatedHunt);

      onHuntSaved(); // Notify parent to reload hunts
      Alert.alert('Success', 'Hunt updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating hunt:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to update hunt. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!hunt) return;

    Alert.alert(
      'Delete Hunt',
      `Are you sure you want to delete the hunt at ${hunt.bankName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // v2.0.0: Delete via API for synchronization
              console.log('Deleting hunt via API...');
              await apiService.deleteHunt(hunt.id!);
              console.log('Hunt deleted via API');
              onHuntDeleted();
              Alert.alert('Success', 'Hunt deleted successfully');
              onClose();
            } catch (error) {
              console.error('Error deleting hunt:', error);
              Alert.alert('Error', 'Failed to delete hunt');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
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
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Hunt</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.deleteButton, isLoading && styles.deleteButtonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
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
              {hunt.branchNumber && ` - Branch #${hunt.branchNumber}`}
            </Text>
            {hunt.branchAddress && (
              <Text style={styles.huntInfoSubtext}>📍 {hunt.branchAddress}</Text>
            )}
            <Text style={styles.huntInfoText}>
              📅 {new Date(hunt.huntDate || hunt.date).toLocaleDateString()}
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
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
  deleteButtonText: {
    fontSize: 16,
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
