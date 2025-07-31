import { Ionicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import React from 'react';

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="Home" options={{ title: 'Home', tabBarIcon:({ color, size }) => (
      <Ionicons name="home-outline" size={size} color={color} />
    ),}} />
      <Tabs.Screen name="Camera" options={{ title: 'Camera', tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={color} />
          ), }} />
      <Tabs.Screen name="Settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ), }} />
    </Tabs>
  )
}

export default _layout