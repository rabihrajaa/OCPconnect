import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const isIOS = Platform.OS === 'ios';  // Correct platform check

export default function CustomKeyboardView({ children,inChat }) {
  
  let kavConfig={}
  let ScrollViewConfig={}
  if(inChat){
    kavConfig={keyboardVerticalOffset: 90}
    ScrollViewConfig={contentContainerStyle:{flex: 1}}
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={isIOS ? 'padding' : 'height'}
        style={{ flex: 1 }}
        {...kavConfig}
      >
        <ScrollView
          style={{ flex: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
          {...ScrollViewConfig}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
