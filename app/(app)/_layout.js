import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeHeader from '../../components/HomeHeader';

export default function _layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="home"
          options={{
            header: () => <HomeHeader />
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
