import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../lib/api.js";

export default function CameraScreen() {
  const [image, setImage] = useState(null);
  const [items, setItems] = useState([]);
  const [roomCode, setRoomCode] = useState(null);
  const [loading, setLoading] = useState(true); // initial loading until token check
  const [processing, setProcessing] = useState(false); // true while uploading
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("accessToken");

      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          await AsyncStorage.removeItem("accessToken");
          router.replace("/");
        } else {
          setLoading(false); // token valid
        }
      } catch (err) {
        console.error("Invalid token:", err);
        await AsyncStorage.removeItem("accessToken");
        router.replace("/");
      }
    };

    checkToken();
  }, []);

  const pickAndSendImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      setImage(localUri);

      // Create FormData with proper structure for React Native
      const formData = new FormData();
      formData.append("image", {
        uri: localUri,
        type: "image/jpeg",
        name: "receipt.jpg",
      });

      console.log('📤 Sending image:', localUri);
      console.log('📤 FormData created');
      console.log('📤 FormData instanceof FormData:', formData instanceof FormData);

      try {
        setProcessing(true);

        const res = await api.post("/api/receipt", formData);

        // The backend now returns room data
        console.log('📦 Full backend response:', res.data);
        setItems(res.data.items);
        setRoomCode(res.data.roomCode);
        console.log('✅ Room created with code:', res.data.roomCode);
        console.log('✅ Items extracted:', res.data.items);

        // Check if roomCode exists before navigating
        if (res.data.roomCode) {
          router.push(`/rooms/${res.data.roomCode}`);
        } else {
          console.error('❌ No room code received from backend');
          console.error('❌ Response data:', res.data);
          Alert.alert('Error', 'Failed to create room. Please try again.');
        }
      } catch (err) {
        console.error("❌ Upload error", err);
        console.error("Error details:", err.response?.data);
      } finally {
        setProcessing(false);
      }
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <TouchableOpacity
        className="bg-blue-500 rounded-xl p-4 mb-4"
        onPress={pickAndSendImage}
      >
        <Text className="text-white text-center font-bold text-lg">
          Pick Receipt Image
        </Text>
      </TouchableOpacity>

      {processing && <ActivityIndicator size="large" color="#007AFF" className="mb-4" />}

      {image && (
        <Image
          source={{ uri: image }}
          className="w-full h-52 object-contain mb-4 rounded-lg"
        />
      )}

      <ScrollView className="space-y-2">
        {items.map((item, index) => (
          <View key={index} className="border-b border-gray-200 pb-2">
            <Text className="text-base">
              {item.name} - ₪{item.price}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
