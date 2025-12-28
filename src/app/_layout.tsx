import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthBootstrap } from '../features/auth/useAuthBootstrap';
import { colors } from '../theme/colors';

export default function RootLayout() {
  useAuthBootstrap();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="search" />
        <Stack.Screen name="classrooms/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="classrooms/mine" />
        <Stack.Screen name="classrooms/edit/[classroomId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="classrooms/[classroomId]" />
        <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/request-password-reset" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/reset-password" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/request-verification" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/verify-email" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
