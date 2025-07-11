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
  Animated,
} from 'react-native';
import { Hunt, HuntHelpers, DenominationEntry } from '../types/Hunt';
import { HuntMigration } from '../utils/HuntMigration';
import { HuntStorage } from '../services/HuntStorage';
import { useToast } from '../contexts/ToastContext';

interface HuntEditModalProps {
  visible: boolean;
  hunt: Hunt | null;
  onClose: () => void;
  onSave: (updatedHunt: Hunt) => void;
  onHuntDeleted: () => void;
}

export const HuntEditModal: React.FC<HuntEditModalProps> = ({
  visible,
  hunt,
  onClose,
  onSave,
  onHuntDeleted,
}) => {
  const { showToast } = useToast();
  const [denominationData, setDenominationData] = useState<{[key: string]: {silverCount: string}}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastAnim] = useState(new Animated.Value(-100));

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    // Slide in
    Animated.timing(toastAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToastVisible(false);
      });
    }, 3000);
  };

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
        showToast(`Please enter a valid number of silver coins for ${denomination}`, 'error');
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
      showToast('Hunt updated successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error updating hunt:', error);
      showToast('Failed to update hunt', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!hunt) return;

    if (!deleteConfirmation) {
      setDeleteConfirmation(true);
      showToast('Tap delete again to confirm', 'error');
      setTimeout(() => setDeleteConfirmation(false), 3000);
      return;
    }

    setIsLoading(true);
    try {
      await HuntStorage.deleteHunt(hunt.id);
      onHuntDeleted();
      showToast('Hunt deleted successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Error deleting hunt:', error);
      showToast('Failed to delete hunt', 'error');
    } finally {
      setIsLoading(false);
      setDeleteConfirmation(false);
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
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.deleteButton, isLoading && styles.deleteButtonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.deleteButtonText}>
                {deleteConfirmation ? 'Confirm Delete' : 'Delete'}
              </Text>
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

        {/* Toast Notification */}
        {toastVisible && (
          <Animated.View
            style={[
              styles.toast,
              {
                backgroundColor: toastType === 'success' ? '#4CAF50' : '#F44336',
                transform: [{ translateY: toastAnim }],
              },
            ]}
          >
            <Text style={styles.toastText}>
              {toastType === 'success' ? '✓' : '!'} {toastMessage}
            </Text>
          </Animated.View>
        )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: '#ccc',
  },
  deleteButtonText: {
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
  toast: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
