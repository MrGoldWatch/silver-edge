import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Hunt } from '../types/api';
import apiService from '../services/api';
import { HuntEditModal } from '../components/HuntEditModal';
import { HuntFormModal } from '../components/HuntFormModal';
import { HuntListModal } from '../components/HuntListModal';

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedHuntForEdit, setSelectedHuntForEdit] = useState<Hunt | null>(null);
  const [huntFormModalVisible, setHuntFormModalVisible] = useState(false);
  const [huntListModalVisible, setHuntListModalVisible] = useState(false);
  const [showWeeklyStats, setShowWeeklyStats] = useState(false);

  useEffect(() => {
    loadHunts();
  }, []);

  const loadHunts = async () => {
    try {
      const response = await apiService.getHunts();
      setHunts(response.hunts || []);
    } catch (error) {
      console.error('Error loading hunts:', error);
      Alert.alert('Error', 'Failed to load hunt history');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadHunts();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleAddHunt = () => {
    setHuntFormModalVisible(true);
  };

  const handleViewHunts = () => {
    setHuntListModalVisible(true);
  };

  const handleEditHunt = (hunt: Hunt) => {
    setSelectedHuntForEdit(hunt);
    setEditModalVisible(true);
  };

  const handleHuntSaved = () => {
    loadHunts(); // Reload hunts after saving
  };

  const handleHuntDeleted = () => {
    loadHunts(); // Reload hunts after deletion
  };

  const calculateStats = (timeframe: 'all' | 'week') => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const filteredHunts = timeframe === 'week' 
      ? hunts.filter(hunt => new Date(hunt.huntDate) >= weekAgo)
      : hunts;

    const totalHunts = filteredHunts.length;
    const totalRolls = filteredHunts.reduce((sum, hunt) => sum + hunt.totalRolls, 0);
    const totalCoinsChecked = filteredHunts.reduce((sum, hunt) => sum + hunt.totalCoinsChecked, 0);
    const totalSilverFound = filteredHunts.reduce((sum, hunt) => sum + hunt.totalSilverFound, 0);
    const successRate = totalCoinsChecked > 0 ? ((totalSilverFound / totalCoinsChecked) * 100) : 0;

    return {
      totalHunts,
      totalRolls,
      totalCoinsChecked,
      totalSilverFound,
      successRate,
    };
  };

  const stats = calculateStats(showWeeklyStats ? 'week' : 'all');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading your hunts...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.firstName || user?.email || 'Hunter'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleAddHunt}>
          <Text style={styles.primaryButtonText}>🎯 Add New Hunt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewHunts}>
          <Text style={styles.secondaryButtonText}>📋 View All Hunts</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Statistics</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowWeeklyStats(!showWeeklyStats)}
          >
            <Text style={styles.toggleButtonText}>
              {showWeeklyStats ? 'All Time' : 'Last 7 Days'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalHunts}</Text>
            <Text style={styles.statLabel}>Total Hunts</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalRolls}</Text>
            <Text style={styles.statLabel}>Rolls Checked</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalCoinsChecked.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Coins Checked</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalSilverFound}</Text>
            <Text style={styles.statLabel}>Silver Found</Text>
          </View>
        </View>

        <View style={styles.successRateContainer}>
          <Text style={styles.successRateLabel}>Success Rate</Text>
          <Text style={styles.successRateValue}>{stats.successRate.toFixed(3)}%</Text>
        </View>
      </View>

      {/* Recent Hunts */}
      {hunts.length > 0 && (
        <View style={styles.recentHuntsContainer}>
          <Text style={styles.sectionTitle}>Recent Hunts</Text>
          {hunts.slice(0, 3).map((hunt) => (
            <TouchableOpacity
              key={hunt.id}
              style={styles.huntCard}
              onPress={() => handleEditHunt(hunt)}
            >
              <View style={styles.huntCardHeader}>
                <Text style={styles.huntBankName}>{hunt.bankName}</Text>
                <Text style={styles.huntDate}>
                  {new Date(hunt.huntDate).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.huntSummary}>
                {hunt.totalRolls} rolls • {hunt.totalSilverFound} silver found
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty State */}
      {hunts.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>🪙 Start Your First Hunt!</Text>
          <Text style={styles.emptyStateText}>
            Track your coin roll hunting adventures and discover silver treasures.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleAddHunt}>
            <Text style={styles.primaryButtonText}>Add Your First Hunt</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <HuntFormModal
        visible={huntFormModalVisible}
        onClose={() => setHuntFormModalVisible(false)}
        onHuntSaved={handleHuntSaved}
      />

      <HuntListModal
        visible={huntListModalVisible}
        onClose={() => setHuntListModalVisible(false)}
        hunts={hunts}
        onEditHunt={handleEditHunt}
        onHuntDeleted={handleHuntDeleted}
      />

      {selectedHuntForEdit && (
        <HuntEditModal
          visible={editModalVisible}
          hunt={selectedHuntForEdit}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedHuntForEdit(null);
          }}
          onHuntSaved={handleHuntSaved}
          onHuntDeleted={handleHuntDeleted}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  welcomeText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  logoutText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#3498DB',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ECF0F1',
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  successRateContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  successRateLabel: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
  },
  successRateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60',
    marginTop: 4,
  },
  recentHuntsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  huntCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  huntCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  huntBankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  huntDate: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  huntSummary: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
});
