import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

interface AppHeaderProps {
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  dismissible = false, 
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.brandingContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {dismissible && (
          <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#F5F5F5',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 4,
    position: 'relative',
  },
  brandingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 90,
    height: 90,
  },

  dismissButton: {
    position: 'absolute',
    right: 20,
    top: 4,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(44, 62, 80, 0.1)',
  },
  dismissButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
