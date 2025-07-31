import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../lib/api.js'; // import my Axios instance

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    try {
      const res = await api.post('/register', {
        name,
        email,
        password,
      });

      Alert.alert('Success', 'Registration complete. Please log in.');
      router.replace('/');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data || 'Server error');
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-center text-gray-800 mb-6">
        Register
      </Text>

      <TextInput
        className="border border-gray-300 rounded-md p-4 mb-4 bg-gray-50 placeholder-gray-500"
        placeholder="Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#6B7280"
      />

      <TextInput
        className="border border-gray-300 rounded-md p-4 mb-4 bg-gray-50 placeholder-gray-500"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#6B7280"
      />

      <TextInput
        className="border border-gray-300 rounded-md p-4 mb-6 bg-gray-50 placeholder-gray-500"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#6B7280"
      />

      <TouchableOpacity
        onPress={handleRegister}
        className="bg-green-500 p-4 rounded-md items-center mb-4"
      >
        <Text className="text-white font-semibold text-lg">Register</Text>
      </TouchableOpacity>

      <Text
        onPress={() => router.replace('/')}
        className="text-blue-500 text-center text-base"
      >
        Already have an account? Log in
      </Text>
    </View>
  );
}
