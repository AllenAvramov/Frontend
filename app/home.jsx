import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        router.replace('/'); // Go to login
        return;
      }

      try {
        const decoded = jwtDecode(token);
        /*
        consolo.log(decoded);
          {
            id: 7,
            email: 'test@example.com',
            iat: 1722111631, // issued at (Unix timestamp)
            exp: 1722115231  // expires at (Unix timestamp)
          }
        */
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          await AsyncStorage.removeItem('accessToken');
          router.replace('/'); // Expired, go to login
        } else {
          setLoading(false); // Token valid → show screen
        }
      } catch (err) {
        console.error('Invalid token:', err);
        await AsyncStorage.removeItem('accessToken');
        router.replace('/');
      }
    };

    checkToken();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold">Welcome to Home!</Text>
    </View>
  );
}
