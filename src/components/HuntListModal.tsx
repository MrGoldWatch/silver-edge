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
} from 'react-native';
import { Hunt, HuntHelpers } from '../types/Hunt';
import { HuntMigration } from '../utils/HuntMigration';

interface HuntListModalProps {
  visible: boolean;
  hunts: Hunt[];
  onClose: () => void;
  onEditHunt: (hunt: Hunt) => void;
}

export const HuntListModal: React.FC<HuntListModalProps> = ({
  visible,
  hunts,
  onClose,
  onEditHunt,
}) => {
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
                      {HuntMigration.getSafeIsProcessed(hunt) ? '✅' : '⏳'}
                    </Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        console.log('Edit button pressed for hunt:', hunt.id);
                        onEditHunt(hunt);
                      }}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
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
