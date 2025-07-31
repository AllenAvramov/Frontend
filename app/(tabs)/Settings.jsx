import React from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../lib/api.js';

const Settings = () => {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call backend logout endpoint
              await api.post('/api/logout');
              console.log('✅ Backend logout successful');

              // Clear all stored tokens
              await AsyncStorage.removeItem('accessToken');
              await AsyncStorage.removeItem('refreshToken');

              console.log('✅ Logout successful - tokens cleared');

              // Navigate to login screen
              router.replace('/');
            } catch (error) {
              console.error('❌ Logout error:', error);
              // Even if backend fails, still clear local tokens
              try {
                await AsyncStorage.removeItem('accessToken');
                await AsyncStorage.removeItem('refreshToken');
                router.replace('/');
              } catch (localError) {
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-6 text-center">Settings</Text>

      <View className="bg-white rounded-lg shadow-sm">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-between p-4 border-b border-gray-100"
        >
          <View className="flex-row items-center">
            <Text className="text-lg font-medium">Logout</Text>
          </View>
          <Text className="text-gray-400">→</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-6 bg-white rounded-lg shadow-sm">
        <View className="p-4 border-b border-gray-100">
          <Text className="text-lg font-medium">Account</Text>
        </View>
        <View className="p-4 border-b border-gray-100">
          <Text className="text-gray-600">Version 1.0.0</Text>
        </View>
      </View>
    </View>
  );
};

export default Settings;