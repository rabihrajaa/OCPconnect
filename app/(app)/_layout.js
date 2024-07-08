import { Stack } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function _layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <Stack />
    </GestureHandlerRootView>
  );
}
