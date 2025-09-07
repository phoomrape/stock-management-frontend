import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// ปิด warning สำหรับ aria-hidden บน web platform
if (Platform.OS === 'web') {
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  console.warn = (...args) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      (args[0].includes('aria-hidden') || args[0].includes('focus'))
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };

  console.error = (...args) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('aria-hidden')
    ) {
      return;
    }
    originalConsoleError(...args);
  };
}

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#4F46E5" />
      <AppNavigator />
    </>
  );
}
