import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

type AuthMode = 'login' | 'register';

export const AuthScreen: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const switchToRegister = () => setAuthMode('register');
  const switchToLogin = () => setAuthMode('login');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {authMode === 'login' ? (
          <LoginScreen onSwitchToRegister={switchToRegister} />
        ) : (
          <RegisterScreen onSwitchToLogin={switchToLogin} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
});
