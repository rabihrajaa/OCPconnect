import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Loading({ size }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView
        style={{ width: size, height: size }}
        source={require('../assets/images/loading.json')}
        autoPlay
        loop
      />
    </View>
    </GestureHandlerRootView>
  );
}
