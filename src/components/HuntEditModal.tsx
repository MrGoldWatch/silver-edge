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
import { Hunt } from '../types/Hunt';
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
  const [silverCount, setSilverCount] = useState('');
  const [processingNotes, setProcessingNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hunt) {
      setSilverCount(hunt.silverCoinsFound.toString());
      setProcessingNotes(hunt.processingNotes || '');
    }
  }, [hunt]);

  const handleSave = async () => {
    if (!hunt) return;

    const newSilverCount = parseInt(silverCount);
    if (isNaN(newSilverCount) || newSilverCount < 0) {
      Alert.alert('Error', 'Please enter a valid number of silver coins');
      return;
    }

    setIsLoading(true);
    try {
      await HuntStorage.updateSilverCount(hunt.id, newSilverCount, processingNotes);
      
      const updatedHunt: Hunt = {
        ...hunt,
        silverCoinsFound: newSilverCount,
        isProcessed: true,
        processingNotes,
        lastUpdated: new Date().toISOString(),
      };

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
      setSilverCount(hunt.silverCoinsFound.toString());
      setProcessingNotes(hunt.processingNotes || '');
    }
    onClose();
  };

  if (!hunt) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

        <ScrollView style={styles.content}>
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
              🪙 {hunt.denomination} • {hunt.numberOfRolls} rolls • {hunt.totalCoinsChecked} coins
            </Text>
            <Text style={styles.huntInfoText}>
              Status: {hunt.isProcessed ? '✅ Processed' : '⏳ Unprocessed'}
            </Text>
          </View>

          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>Silver Coins Found</Text>
            <Text style={styles.helpText}>
              Update this after you've had time to properly examine your coins
            </Text>
            <TextInput
              style={styles.input}
              value={silverCount}
              onChangeText={setSilverCount}
              placeholder="Number of silver coins found"
              keyboardType="numeric"
              selectTextOnFocus
            />
          </View>

          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>Processing Notes</Text>
            <Text style={styles.helpText}>
              Add notes about what you found, coin conditions, dates, etc.
            </Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={processingNotes}
              onChangeText={setProcessingNotes}
              placeholder="e.g., Found 2 Mercury dimes (1943, 1944), 1 Walking Liberty half (1945)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

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
    padding: 16,
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
