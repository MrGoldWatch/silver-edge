import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Hunt, HuntHelpers } from '../types/Hunt';
import { HuntMigration } from '../utils/HuntMigration';
import { useToast } from '../contexts/ToastContext';
import { HuntStorage } from '../services/HuntStorage';

interface HuntListModalProps {
  visible: boolean;
  hunts: Hunt[];
  onClose: () => void;
  onEditHunt: (hunt: Hunt) => void;
  onHuntDeleted: () => void;
}

export const HuntListModal: React.FC<HuntListModalProps> = ({
  visible,
  hunts,
  onClose,
  onEditHunt,
  onHuntDeleted,
}) => {
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [huntToDelete, setHuntToDelete] = useState<Hunt | null>(null);
  const [localToastVisible, setLocalToastVisible] = useState(false);
  const [localToastMessage, setLocalToastMessage] = useState('');
  const [localToastAnim] = useState(new Animated.Value(-100));

  const showLocalToast = (message: string) => {
    setLocalToastMessage(message);
    setLocalToastVisible(true);

    // Slide in
    Animated.timing(localToastAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      Animated.timing(localToastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setLocalToastVisible(false);
      });
    }, 3000);
  };

  const handleDeleteHunt = (hunt: Hunt) => {
    setHuntToDelete(hunt);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!huntToDelete) return;

    setShowDeleteModal(false);
    try {
      await HuntStorage.deleteHunt(huntToDelete.id);
      onHuntDeleted();
      // Show success alert on hunt list page
      showLocalToast('Hunt deleted successfully!');
    } catch (error) {
      console.error('Error deleting hunt:', error);
      showToast('Failed to delete hunt', 'error');
    } finally {
      setHuntToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setHuntToDelete(null);
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>All Hunts ({hunts.length})</Text>
          <View style={styles.placeholder} />
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
          {hunts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🪙</Text>
              <Text style={styles.emptyStateText}>No hunts recorded yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your coin roll hunting adventures will appear here once you start tracking them.
              </Text>
              <Text style={styles.emptyStateHint}>
                Close this screen and tap "Add New Hunt" to get started!
              </Text>
            </View>
          ) : (
            hunts.map((hunt) => (
              <View key={hunt.id} style={styles.huntCard}>
                <View style={styles.huntHeader}>
                  <View style={styles.huntInfo}>
                    <Text style={styles.huntBank}>
                      🏦 {hunt.branchName || hunt.bankName}
                    </Text>
                    {hunt.branchAddress && (
                      <Text style={styles.huntBranchAddress}>
                        📍 {hunt.branchAddress}
                      </Text>
                    )}
                  </View>
                  <View style={styles.huntActions}>
                    <Text style={[
                      styles.statusBadge,
                      HuntMigration.getSafeIsProcessed(hunt) ? styles.processedBadge : styles.unprocessedBadge
                    ]}>
                      {HuntMigration.getSafeIsProcessed(hunt) ? '●' : '○'}
                    </Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        console.log('Edit button pressed for hunt:', hunt.id);
                        onEditHunt(hunt);
                      }}
                    >
                      <Text style={styles.editButtonText}>⚙</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteHunt(hunt)}
                    >
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.huntDetails}>
                  <Text style={styles.huntDetailText}>
                    {HuntMigration.getSafeDenominationSummary(hunt)}
                  </Text>
                  <Text style={styles.huntDetailText}>
                    {HuntMigration.getSafeTotalCoinsChecked(hunt)} coins • {HuntMigration.getSafeTotalSilverFound(hunt)} silver
                  </Text>
                  {HuntMigration.isNewHunt(hunt) && hunt.denominations.map((denom, index) => (
                    <Text key={index} style={styles.denominationDetail}>
                      {denom.denomination}: {denom.totalCoinsChecked} coins, {denom.silverCoinsFound} silver
                      {denom.processingNotes && ` - ${denom.processingNotes}`}
                    </Text>
                  ))}
                  {hunt.processingNotes && (
                    <Text style={styles.processingNotes}>
                      📝 {hunt.processingNotes}
                    </Text>
                  )}
                </View>
                
                <View style={styles.huntFooter}>
                  <Text style={styles.huntDate}>
                    {new Date(hunt.date).toLocaleDateString()}
                  </Text>
                  {hunt.lastUpdated && hunt.lastUpdated !== hunt.date && (
                    <Text style={styles.updatedIndicator}>
                      Updated: {new Date(hunt.lastUpdated).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>


      </KeyboardAvoidingView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Hunt</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete the hunt at {huntToDelete?.bankName}?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirmButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteModalConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Local Toast for Hunt List Modal */}
      {localToastVisible && (
        <Animated.View
          style={[
            styles.localToastContainer,
            {
              transform: [{ translateY: localToastAnim }],
            },
          ]}
        >
          <Text style={styles.localToastText}>{localToastMessage}</Text>
        </Animated.View>
      )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 300,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  huntCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  huntHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  huntInfo: {
    flex: 1,
  },
  huntBank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  huntBranchAddress: {
    fontSize: 12,
    color: '#666',
  },
  huntActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    fontSize: 16,
    marginRight: 8,
  },
  processedBadge: {
    // Green checkmark already styled
  },
  unprocessedBadge: {
    // Clock already styled
  },
  editButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: 'white',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 280,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteModalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  deleteModalCancelText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  deleteModalConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ff4444',
    alignItems: 'center',
  },
  deleteModalConfirmText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  huntDetails: {
    marginBottom: 8,
  },
  huntDetailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  denominationDetail: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginBottom: 1,
  },
  processingNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  huntFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  huntDate: {
    fontSize: 12,
    color: '#999',
  },
  updatedIndicator: {
    fontSize: 10,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  localToastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  localToastText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },

});
