import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Hunt } from '../types/api';
import apiService from '../services/api';

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

  const handleDeleteHunt = async (hunt: Hunt) => {
    Alert.alert(
      'Delete Hunt',
      `Are you sure you want to delete the hunt at ${hunt.bankName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteHunt(hunt.id);
              onHuntDeleted();
              Alert.alert('Success', 'Hunt deleted successfully');
            } catch (error) {
              console.error('Error deleting hunt:', error);
              Alert.alert('Error', 'Failed to delete hunt');
            }
          },
        },
      ]
    );
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
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
                      {hunt.branchNumber && ` - Branch #${hunt.branchNumber}`}
                    </Text>
                    {hunt.branchAddress && (
                      <Text style={styles.huntBranchAddress}>
                        📍 {hunt.branchAddress}
                      </Text>
                    )}
                  </View>
                  <View style={styles.huntActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => onEditHunt(hunt)}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteHunt(hunt)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.huntDetails}>
                  <Text style={styles.huntDetailText}>
                    {hunt.totalRolls} rolls • {hunt.totalCoinsChecked.toLocaleString()} coins • {hunt.totalSilverFound} silver
                  </Text>
                  {hunt.denominations.map((denom, index) => (
                    <Text key={index} style={styles.denominationDetail}>
                      {denom.denomination}: {denom.numberOfRolls} rolls ({denom.totalCoinsChecked} coins), {denom.silverCoinsFound} silver
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
                    {new Date(hunt.huntDate).toLocaleDateString()}
                  </Text>
                  {hunt.updatedAt && hunt.updatedAt !== hunt.createdAt && (
                    <Text style={styles.updatedIndicator}>
                      Updated: {new Date(hunt.updatedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            ))
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
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    backgroundColor: '#FFE5E5',
    borderRadius: 6,
    padding: 6,
    marginLeft: 8,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
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
});
