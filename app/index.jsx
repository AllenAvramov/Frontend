import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from '../lib/api.js';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please fill in both email and password.");
      return;
    }

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      const { accessToken, refreshToken } = res.data;
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      router.replace('/(tabs)/Home'); // go to protected route after login
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data || "Server error");
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      
      <Text className="text-3xl font-bold text-center mb-8 text-gray-800">
        Log In
      </Text>

      <TextInput
        className="border border-gray-300 rounded-md p-4 mb-4 bg-gray-50 placeholder-gray-500"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#6B7280"
      />

      <TextInput
        className="border border-gray-300 rounded-md p-4 mb-6 bg-gray-50 placeholder-gray-500"
        placeholder="Password"
        placeholderTextColor="#6B7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleLogin}
        className="bg-blue-500 p-4 rounded-md items-center mb-4"
      >
        <Text className="text-white font-semibold text-lg">Log In</Text>
      </TouchableOpacity>

      <Text
        onPress={() => router.push("/register")}
        className="text-blue-500 text-center text-base"
      >
        Don't have an account? Register
      </Text>
    </View>
  );
}
