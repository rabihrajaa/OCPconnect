import React from 'react';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function SignUp() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={{paddingTop: 40}} className="bg-red-200">
      <Text className="text-3xl text-center">SignUp</Text>
    </View>
    </GestureHandlerRootView>
  );
}
