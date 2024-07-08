import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function StartPage() {
  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 justify-center">
        <ActivityIndicator size="large" color="gray" />
      </View>
    </GestureHandlerRootView>

  );
}
