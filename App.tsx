import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  LogBox,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';

// Suppress VirtualizedList warnings from dependencies
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews',
]);
import { StatusBar } from 'expo-status-bar';
import { Hunt, HuntHelpers } from './src/types/Hunt';
import { HuntMigration } from './src/utils/HuntMigration';
import { HuntStorage } from './src/services/HuntStorage';
import { HuntEditModal } from './src/components/HuntEditModal';
import { HuntFormModal } from './src/components/HuntFormModal';
import { HuntListModal } from './src/components/HuntListModal';
import { ToastProvider, useToast } from './src/contexts/ToastContext';

// Main App Component
function AppContent() {
  const { showToast } = useToast();
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedHuntForEdit, setSelectedHuntForEdit] = useState<Hunt | null>(null);
  const [huntFormModalVisible, setHuntFormModalVisible] = useState<boolean>(false);
  const [huntListModalVisible, setHuntListModalVisible] = useState<boolean>(false);
  const [showWeeklyStats, setShowWeeklyStats] = useState<boolean>(false);

  // Load hunts on app start
  useEffect(() => {
    loadHunts();
  }, []);

  const loadHunts = async () => {
    try {
      const savedHunts = await HuntStorage.getAllHunts();
      setHunts(savedHunts);
    } catch (error) {
      console.error('Error loading hunts:', error);
      showToast('Failed to load hunt history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHuntSaved = (newHunt: Hunt) => {
    setHunts(prevHunts => [newHunt, ...prevHunts]);
    setHuntFormModalVisible(false);

    // Show success toast on main screen after modal closes
    setTimeout(() => {
      showToast('Hunt saved successfully!', 'success');
    }, 100);
  };

  const handleHuntDeleted = () => {
    loadHunts();

    // Show success toast on main screen after modal closes
    setTimeout(() => {
      showToast('Hunt deleted successfully!', 'success');
    }, 100);
  };

  const handleEditHunt = (hunt: Hunt) => {
    setSelectedHuntForEdit(hunt);
    setHuntListModalVisible(false); // Close the list modal first
    setEditModalVisible(true);
  };

  const handleSaveEdit = async (updatedHunt: Hunt) => {
    setHunts(prevHunts =>
      prevHunts.map(hunt =>
        hunt.id === updatedHunt.id ? updatedHunt : hunt
      )
    );
    setEditModalVisible(false);
    setSelectedHuntForEdit(null);
    // Reload hunts to ensure we have the latest data
    await loadHunts();
  };

  const calculateStats = (weeklyOnly: boolean = false) => {
    let relevantHunts = hunts;

    if (weeklyOnly) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      relevantHunts = hunts.filter(hunt => {
        const huntDate = new Date(hunt.date);
        return huntDate >= oneWeekAgo;
      });
    }

    const totalCoinsChecked = relevantHunts.reduce((sum, hunt) => sum + HuntMigration.getSafeTotalCoinsChecked(hunt), 0);
    const totalSilverFound = relevantHunts.reduce((sum, hunt) => sum + HuntMigration.getSafeTotalSilverFound(hunt), 0);
    const successRate = totalCoinsChecked > 0 ? ((totalSilverFound / totalCoinsChecked) * 100).toFixed(2) : '0.00';

    return {
      totalHunts: relevantHunts.length,
      totalCoinsChecked,
      totalSilverFound,
      successRate,
    };
  };

  const stats = calculateStats(showWeeklyStats);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>🪙</Text>
        <Text style={styles.loadingText}>Loading Silver Edge...</Text>
        <Text style={styles.loadingSubtext}>Preparing your hunt data</Text>
      </View>
    );
  }

  const handleDismiss = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={handleDismiss}>
      <View style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>🪙 Silver Edge</Text>

        {/* Stats Toggle */}
        <View style={styles.statsToggleContainer}>
          <TouchableOpacity
            style={[styles.statsToggleButton, !showWeeklyStats && styles.statsToggleButtonActive]}
            onPress={() => setShowWeeklyStats(false)}
          >
            <Text style={[styles.statsToggleText, !showWeeklyStats && styles.statsToggleTextActive]}>
              All Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statsToggleButton, showWeeklyStats && styles.statsToggleButtonActive]}
            onPress={() => setShowWeeklyStats(true)}
          >
            <Text style={[styles.statsToggleText, showWeeklyStats && styles.statsToggleTextActive]}>
              Last 7 Days
            </Text>
          </TouchableOpacity>
        </View>

        {hunts.length === 0 ? (
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome to Silver Edge! 🪙</Text>
            <Text style={styles.welcomeText}>
              Ready to start your coin roll hunting journey? Track your bank visits, record your silver finds, and analyze your success rates.
            </Text>
            <Text style={styles.welcomeSubtext}>
              Tap "Add New Hunt" below to record your first coin roll hunting expedition!
            </Text>
          </View>
        ) : (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>
              {showWeeklyStats ? 'Last 7 Days Statistics' : 'All Time Statistics'}
            </Text>
            <Text>Total Hunts: {stats.totalHunts}</Text>
            <Text>Coins Checked: {stats.totalCoinsChecked.toLocaleString()}</Text>
            <Text>Silver Found: {stats.totalSilverFound}</Text>
            <Text>Success Rate: {stats.successRate}%</Text>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => setHuntFormModalVisible(true)}
          >
            <Text style={styles.navigationButtonText}>➕ Add New Hunt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => setHuntListModalVisible(true)}
          >
            <Text style={styles.navigationButtonText}>📋 View & Edit Hunts</Text>
          </TouchableOpacity>
        </View>




        </ScrollView>

        <HuntFormModal
          visible={huntFormModalVisible}
          onClose={() => setHuntFormModalVisible(false)}
          onSave={handleHuntSaved}
        />

        <HuntListModal
          visible={huntListModalVisible}
          hunts={hunts}
          onClose={() => setHuntListModalVisible(false)}
          onEditHunt={handleEditHunt}
          onHuntDeleted={handleHuntDeleted}
        />

        <HuntEditModal
          visible={editModalVisible}
          hunt={selectedHuntForEdit}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedHuntForEdit(null);
          }}
          onSave={handleSaveEdit}
          onHuntDeleted={handleHuntDeleted}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  welcomeCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    color: '#555',
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  statsToggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  statsToggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  statsToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  statsToggleTextActive: {
    color: '#fff',
  },
  navigationContainer: {
    marginBottom: 20,
  },
  navigationButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navigationButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },

  denominationContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  denominationButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  denominationButtonActive: {
    backgroundColor: '#007AFF',
  },
  denominationText: {
    fontSize: 16,
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
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  huntsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  huntItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  huntBank: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  huntDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  branchInfo: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  branchInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 4,
  },
  branchAddressText: {
    fontSize: 12,
    color: '#666',
  },
  huntBranchAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
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
  huntActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    fontSize: 16,
    fontWeight: '600',
  },
  processedBadge: {
    color: '#4CAF50',
  },
  unprocessedBadge: {
    color: '#FF9800',
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  editButtonText: {
    fontSize: 16,
  },
  processingNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
  },
  updatedIndicator: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
});

// Main App
export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}