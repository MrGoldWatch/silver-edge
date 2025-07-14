import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Hunt } from '../types/api';
import apiService from '../services/api';
import { DateRangePicker } from '../components/DateRangePicker';

interface StatisticsScreenProps {
  visible: boolean;
  onClose: () => void;
  hunts: Hunt[];
}

type StatView = 'overview' | 'banks' | 'denominations' | 'trends';
type TimeRange = 'all' | 'week' | 'month' | 'custom';

interface BankStats {
  bankName: string;
  hunts: number;
  totalSilver: number;
  totalCoins: number;
  successRate: number;
}

interface DenominationStats {
  denomination: string;
  rolls: number;
  coinsChecked: number;
  silverFound: number;
  successRate: number;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  visible,
  onClose,
  hunts,
}) => {
  const [currentView, setCurrentView] = useState<StatView>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getFilteredHunts = () => {
    const now = new Date();
    let startDate: Date | null = null;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        startDate = customStartDate;
        break;
      default:
        return hunts;
    }

    if (!startDate) return hunts;

    return hunts.filter(hunt => {
      const huntDate = new Date(hunt.huntDate);
      const isAfterStart = huntDate >= startDate!;
      const isBeforeEnd = !customEndDate || huntDate <= customEndDate;
      return isAfterStart && isBeforeEnd;
    });
  };

  const calculateOverviewStats = () => {
    const filteredHunts = getFilteredHunts();
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

  const calculateBankStats = (): BankStats[] => {
    const filteredHunts = getFilteredHunts();
    const bankMap = new Map<string, BankStats>();

    filteredHunts.forEach(hunt => {
      const existing = bankMap.get(hunt.bankName) || {
        bankName: hunt.bankName,
        hunts: 0,
        totalSilver: 0,
        totalCoins: 0,
        successRate: 0,
      };

      existing.hunts += 1;
      existing.totalSilver += hunt.totalSilverFound;
      existing.totalCoins += hunt.totalCoinsChecked;
      existing.successRate = existing.totalCoins > 0 ? 
        ((existing.totalSilver / existing.totalCoins) * 100) : 0;

      bankMap.set(hunt.bankName, existing);
    });

    return Array.from(bankMap.values()).sort((a, b) => b.successRate - a.successRate);
  };

  const calculateDenominationStats = (): DenominationStats[] => {
    const filteredHunts = getFilteredHunts();
    const denomMap = new Map<string, DenominationStats>();

    filteredHunts.forEach(hunt => {
      hunt.denominations?.forEach(denom => {
        const existing = denomMap.get(denom.denomination) || {
          denomination: denom.denomination,
          rolls: 0,
          coinsChecked: 0,
          silverFound: 0,
          successRate: 0,
        };

        existing.rolls += denom.numberOfRolls;
        existing.coinsChecked += denom.totalCoinsChecked;
        existing.silverFound += denom.silverCoinsFound;
        existing.successRate = existing.coinsChecked > 0 ? 
          ((existing.silverFound / existing.coinsChecked) * 100) : 0;

        denomMap.set(denom.denomination, existing);
      });
    });

    return Array.from(denomMap.values()).sort((a, b) => b.successRate - a.successRate);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    if (range === 'custom') {
      setShowDatePicker(true);
    }
  };

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setShowDatePicker(false);
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(['all', 'week', 'month', 'custom'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive
            ]}
            onPress={() => handleTimeRangeChange(range)}
          >
            <Text style={[
              styles.timeRangeButtonText,
              timeRange === range && styles.timeRangeButtonTextActive
            ]}>
              {range === 'all' ? 'All Time' : 
               range === 'week' ? 'Last 7 Days' :
               range === 'month' ? 'Last 30 Days' : 'Custom Range'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {timeRange === 'custom' && customStartDate && customEndDate && (
        <Text style={styles.customRangeText}>
          {customStartDate.toLocaleDateString()} - {customEndDate.toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  const renderViewSelector = () => (
    <View style={styles.viewSelectorContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {([
          { key: 'overview', label: '📊 Overview', icon: '📊' },
          { key: 'banks', label: '🏦 Banks', icon: '🏦' },
          { key: 'denominations', label: '🪙 Coins', icon: '🪙' },
          { key: 'trends', label: '📈 Trends', icon: '📈' },
        ] as const).map((view) => (
          <TouchableOpacity
            key={view.key}
            style={[
              styles.viewButton,
              currentView === view.key && styles.viewButtonActive
            ]}
            onPress={() => setCurrentView(view.key)}
          >
            <Text style={styles.viewButtonIcon}>{view.icon}</Text>
            <Text style={[
              styles.viewButtonText,
              currentView === view.key && styles.viewButtonTextActive
            ]}>
              {view.label.replace(/^.+ /, '')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderOverviewStats = () => {
    const stats = calculateOverviewStats();
    
    return (
      <View style={styles.statsContainer}>
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
        
        <View style={styles.successRateCard}>
          <Text style={styles.successRateLabel}>Success Rate</Text>
          <Text style={styles.successRateValue}>{stats.successRate.toFixed(3)}%</Text>
          <Text style={styles.successRateSubtext}>
            {stats.totalSilverFound} silver coins found in {stats.totalCoinsChecked.toLocaleString()} coins checked
          </Text>
        </View>
      </View>
    );
  };

  const renderBankStats = () => {
    const bankStats = calculateBankStats();
    
    if (bankStats.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No bank data available for selected time range</Text>
        </View>
      );
    }

    return (
      <View style={styles.bankStatsContainer}>
        <Text style={styles.sectionTitle}>Bank Performance</Text>
        {bankStats.map((bank, index) => (
          <View key={bank.bankName} style={styles.bankCard}>
            <View style={styles.bankHeader}>
              <Text style={styles.bankName}>🏦 {bank.bankName}</Text>
              <Text style={styles.bankRank}>#{index + 1}</Text>
            </View>
            <View style={styles.bankStatsRow}>
              <View style={styles.bankStat}>
                <Text style={styles.bankStatNumber}>{bank.hunts}</Text>
                <Text style={styles.bankStatLabel}>Hunts</Text>
              </View>
              <View style={styles.bankStat}>
                <Text style={styles.bankStatNumber}>{bank.totalSilver}</Text>
                <Text style={styles.bankStatLabel}>Silver Found</Text>
              </View>
              <View style={styles.bankStat}>
                <Text style={styles.bankStatNumber}>{bank.totalCoins.toLocaleString()}</Text>
                <Text style={styles.bankStatLabel}>Coins Checked</Text>
              </View>
              <View style={styles.bankStat}>
                <Text style={[styles.bankStatNumber, { color: bank.successRate > 0.1 ? '#27AE60' : '#E74C3C' }]}>
                  {bank.successRate.toFixed(3)}%
                </Text>
                <Text style={styles.bankStatLabel}>Success Rate</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderDenominationStats = () => {
    const denomStats = calculateDenominationStats();

    if (denomStats.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No denomination data available for selected time range</Text>
        </View>
      );
    }

    return (
      <View style={styles.bankStatsContainer}>
        <Text style={styles.sectionTitle}>Denomination Performance</Text>
        {denomStats.map((denom, index) => (
          <View key={denom.denomination} style={styles.bankCard}>
            <View style={styles.bankHeader}>
              <Text style={styles.bankName}>🪙 {denom.denomination}</Text>
              <Text style={styles.bankRank}>#{index + 1}</Text>
            </View>
            <View style={styles.bankStatsRow}>
              <View style={styles.bankStat}>
                <Text style={styles.bankStatNumber}>{denom.rolls}</Text>
                <Text style={styles.bankStatLabel}>Rolls</Text>
              </View>
              <View style={styles.bankStat}>
                <Text style={styles.bankStatNumber}>{denom.silverFound}</Text>
                <Text style={styles.bankStatLabel}>Silver Found</Text>
              </View>
              <View style={styles.bankStat}>
                <Text style={styles.bankStatNumber}>{denom.coinsChecked.toLocaleString()}</Text>
                <Text style={styles.bankStatLabel}>Coins Checked</Text>
              </View>
              <View style={styles.bankStat}>
                <Text style={[styles.bankStatNumber, { color: denom.successRate > 0.1 ? '#27AE60' : '#E74C3C' }]}>
                  {denom.successRate.toFixed(3)}%
                </Text>
                <Text style={styles.bankStatLabel}>Success Rate</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
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
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📊 Statistics</Text>
          <View style={styles.placeholder} />
        </View>

        {renderTimeRangeSelector()}
        {renderViewSelector()}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {currentView === 'overview' && renderOverviewStats()}
          {currentView === 'banks' && renderBankStats()}
          {currentView === 'denominations' && renderDenominationStats()}
          {currentView === 'trends' && (
            <Text style={styles.comingSoon}>Trend analysis coming soon!</Text>
          )}
        </ScrollView>

        {showDatePicker && (
          <DateRangePicker
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onSelect={handleDateRangeSelect}
            initialStartDate={customStartDate}
            initialEndDate={customEndDate}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  placeholder: {
    width: 60,
  },
  timeRangeContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 10,
  },
  timeRangeButtonActive: {
    backgroundColor: '#3498DB',
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  timeRangeButtonTextActive: {
    color: '#FFFFFF',
  },
  customRangeText: {
    marginTop: 10,
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  viewSelectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  viewButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginRight: 15,
    minWidth: 80,
  },
  viewButtonActive: {
    backgroundColor: '#3498DB',
  },
  viewButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  viewButtonText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  viewButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  successRateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successRateLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  successRateValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 8,
  },
  successRateSubtext: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
  },
  bankStatsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  bankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  bankRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  bankStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankStat: {
    alignItems: 'center',
    flex: 1,
  },
  bankStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  bankStatLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  comingSoon: {
    padding: 40,
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
