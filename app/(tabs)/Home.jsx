import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../lib/api.js';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [roomCode, setRoomCode] = useState('');
  const [joining, setJoining] = useState(false);

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

  const joinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      return;
    }

    try {
      setJoining(true);
      const response = await api.get(`/api/room/${roomCode.trim().toUpperCase()}`);
      console.log('✅ Room joined:', response.data);
      router.push(`/rooms/${roomCode.trim().toUpperCase()}`);
    } catch (error) {
      console.error('❌ Error joining room:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
    
      <Text className="text-2xl font-bold mb-8">Welcome to Splitify!</Text>
      <Image
        source={require('../../assets/images/icon.png')} 
        style={{ width: 120, height: 120, resizeMode: 'contain' }}
      />

      <View className="w-full mb-6">
        <Text className="text-lg font-semibold mb-4 text-center">
          Join a Room
        </Text>
        <TextInput
          className="border border-gray-300 rounded-md p-4 mb-4 bg-gray-50 placeholder-gray-500"
          placeholder="Enter room code"
          value={roomCode}
          onChangeText={setRoomCode}
          autoCapitalize="characters"
          maxLength={6}
          placeholderTextColor="#6B7280"
        />
        <TouchableOpacity
          onPress={joinRoom}
          disabled={joining}
          className="bg-blue-500 p-4 rounded-md"
        >
          <Text className="text-white font-semibold text-center">
            {joining ? 'Joining...' : 'Join Room'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-gray-600 text-center mb-4">
        Or scan a receipt to create a new room
      </Text>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/Camera')}
        className="bg-green-500 p-4 rounded-md w-full"
      >
        <Text className="text-white font-semibold text-center">
          Scan Receipt
        </Text>
      </TouchableOpacity>
    </View>
  );
}
