import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  visible,
  onClose,
  onSelect,
  initialStartDate,
  initialEndDate,
}) => {
  const [startDate, setStartDate] = useState<Date>(initialStartDate || new Date());
  const [endDate, setEndDate] = useState<Date>(initialEndDate || new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartDateChange = () => {
    setShowStartPicker(false);
    // For now, just show the note about native picker coming soon
    Alert.alert('Coming Soon', 'Native date picker will be available in the next update. Please use the quick range buttons for now.');
  };

  const handleEndDateChange = () => {
    setShowEndPicker(false);
    // For now, just show the note about native picker coming soon
    Alert.alert('Coming Soon', 'Native date picker will be available in the next update. Please use the quick range buttons for now.');
  };

  const handleConfirm = () => {
    if (startDate > endDate) {
      Alert.alert('Invalid Date Range', 'Start date cannot be after end date');
      return;
    }
    onSelect(startDate, endDate);
  };

  const handleCancel = () => {
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getQuickRanges = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
      {
        label: 'Last 7 Days',
        startDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        endDate: today,
      },
      {
        label: 'Last 30 Days',
        startDate: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
        endDate: today,
      },
      {
        label: 'Last 3 Months',
        startDate: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000),
        endDate: today,
      },
      {
        label: 'This Year',
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: today,
      },
    ];
  };

  const handleQuickRange = (quickStart: Date, quickEnd: Date) => {
    setStartDate(quickStart);
    setEndDate(quickEnd);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Date Range</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Quick Range Buttons */}
          <View style={styles.quickRangesContainer}>
            <Text style={styles.sectionTitle}>Quick Ranges</Text>
            <View style={styles.quickRangesGrid}>
              {getQuickRanges().map((range, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickRangeButton}
                  onPress={() => handleQuickRange(range.startDate, range.endDate)}
                >
                  <Text style={styles.quickRangeButtonText}>{range.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Date Selection */}
          <View style={styles.customDateContainer}>
            <Text style={styles.sectionTitle}>Custom Range</Text>
            
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>End Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Range Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Selected Range</Text>
            <Text style={styles.summaryText}>
              {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
            <Text style={styles.summaryDays}>
              {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
            </Text>
          </View>
        </View>

        {/* Note: Native date picker will be added in future update */}
        {(showStartPicker || showEndPicker) && (
          <View style={styles.datePickerNote}>
            <Text style={styles.datePickerNoteText}>
              📅 Native date picker coming soon! For now, use the quick range buttons above.
            </Text>
          </View>
        )}
      </View>
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
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3498DB',
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  quickRangesContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  quickRangesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickRangeButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickRangeButtonText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  customDateContainer: {
    marginBottom: 30,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 120,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  summaryDays: {
    fontSize: 12,
    color: '#95A5A6',
  },
  datePickerNote: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 15,
    margin: 20,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  datePickerNoteText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
});
