import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import api from '../../lib/api.js';

const RoomCode = () => {
  const { code } = useLocalSearchParams();
  const router = useRouter();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [userShare, setUserShare] = useState(0);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/room/${code}`);
        setRoomData(response.data);
        console.log('✅ Room data loaded:', response.data);
        console.log('✅ User selections:', response.data.userSelections);

        // Set current user's selected items based on their selections
        const currentUserSelections = response.data.userSelections?.filter(
          selection => selection.user_id === response.data.currentUserId
        ).map(selection => selection.item_index) || [];

        console.log('✅ Current user selections:', currentUserSelections);
        setSelectedItems(currentUserSelections);
      } catch (err) {
        console.error('❌ Error loading room:', err);
        setError(err.response?.data?.error || 'Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [code]);

  // Calculate user's share when selected items change
  useEffect(() => {
    if (selectedItems.length > 0 && roomData?.items) {
      // Count how many users selected each item
      const itemUserCounts = {};
      roomData.userSelections?.forEach(selection => {
        if (!itemUserCounts[selection.item_index]) {
          itemUserCounts[selection.item_index] = 0;
        }
        itemUserCounts[selection.item_index]++;
      });

      console.log('🔍 Frontend item user counts:', itemUserCounts);

      // Calculate share based on how many users selected each item
      let userShare = 0;

      selectedItems.forEach(itemIndex => {
        const item = roomData.items[itemIndex];
        const itemPrice = parseFloat(item.price.replace(',', '.'));

        // Count how many users selected this item
        const usersForThisItem = itemUserCounts[itemIndex] || 1;
        const itemShare = itemPrice / usersForThisItem;

        console.log(`🔍 Frontend Item ${itemIndex}: price=${itemPrice}, users=${usersForThisItem}, share=${itemShare}`);
        userShare += itemShare;
      });

      console.log(`🔍 Frontend Total user share: ${userShare}`);
      setUserShare(userShare);
    } else {
      setUserShare(0);
    }
  }, [selectedItems, roomData]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4">Loading room...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-xl font-bold text-red-600 mb-4">Error</Text>
        <Text className="text-center mb-6">{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 p-4 rounded-md"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-6">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-center mb-2">
          Room: {roomData?.roomCode}
        </Text>
        <Text className="text-gray-600 text-center">
          Share this code with friends to split the bill
        </Text>
      </View>

      <ScrollView className="flex-1">
        <Text className="text-lg font-semibold mb-4">Select Items to Pay:</Text>
        {roomData?.items?.map((item, index) => {
          const isSelected = selectedItems.includes(index);
          const itemPrice = parseFloat(item.price.replace(',', '.'));

          // Count how many users selected this specific item
          const usersForThisItem = roomData.userSelections?.filter(
            selection => selection.item_index === index
          ).length || 1;

          const splitPrice = itemPrice / usersForThisItem;

          console.log(`🔍 Item ${index}: price=${itemPrice}, users=${usersForThisItem}, split=${splitPrice}`);

          return (
            <TouchableOpacity
              key={index}
              onPress={async () => {
                try {
                  if (isSelected) {
                    // Unselect item
                    await api.delete(`/api/room/${code}/select/${index}`);
                    setSelectedItems(selectedItems.filter(i => i !== index));
                  } else {
                    // Select item
                    await api.post(`/api/room/${code}/select`, { itemIndex: index });
                    setSelectedItems([...selectedItems, index]);
                  }

                  // Refresh room data to get updated selections
                  const response = await api.get(`/api/room/${code}`);
                  setRoomData(response.data);
                  console.log('✅ Room data refreshed after selection');
                } catch (error) {
                  console.error('❌ Error updating selection:', error);
                  Alert.alert('Error', 'Failed to update selection');
                }
              }}
              className={`flex-row justify-between py-3 border-b border-gray-200 ${isSelected ? 'bg-blue-50' : ''
                }`}
            >
              <View className="flex-1">
                <Text className={`text-base ${isSelected ? 'font-semibold' : ''}`}>
                  {item.name}
                </Text>
                {isSelected && (
                  <Text className="text-sm text-blue-600">
                    Your share: ₪{splitPrice.toFixed(2)}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center">
                <Text className="text-base font-semibold mr-3">₪{item.price}</Text>
                <View className={`w-6 h-6 rounded-full border-2 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  } items-center justify-center`}>
                  {isSelected && (
                    <Text className="text-white text-sm">✓</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {selectedItems.length > 0 && (
          <View className="mt-6 p-4 bg-blue-50 rounded-lg">
            <Text className="text-lg font-semibold mb-2">Your Selection:</Text>
            <Text className="text-base mb-2">
              Selected {selectedItems.length} items
            </Text>
            <Text className="text-lg font-bold text-blue-600">
              Your Share: ₪{userShare.toFixed(2)}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {roomData.userSelections?.filter(s => selectedItems.includes(s.item_index)).length > selectedItems.length
                ? 'Some items are shared with other users'
                : 'All items are yours only'}
            </Text>
          </View>
        )}

        <View className="flex-row space-x-2 mt-4">
          <TouchableOpacity
            onPress={async () => {
              try {
                // Refresh room data
                const response = await api.get(`/api/room/${code}`);
                setRoomData(response.data);
                console.log('✅ Room data refreshed manually');
              } catch (error) {
                console.error('❌ Error refreshing room:', error);
                Alert.alert('Error', 'Failed to refresh room data');
              }
            }}
            className="flex-1 bg-blue-500 p-4 rounded-md"
          >
            <Text className="text-white font-semibold text-center">
              Refresh
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              try {
                const response = await api.get(`/api/room/${code}/splits`);
                const { splits } = response.data;

                let message = 'Bill Splits:\n\n';
                Object.keys(splits).forEach(userEmail => {
                  const userData = splits[userEmail];
                  message += `${userEmail}: ₪${userData.total.toFixed(2)}\n`;
                  message += `Items: ${userData.items.length}\n\n`;
                });

                Alert.alert('Bill Splits', message);
              } catch (error) {
                console.error('❌ Error getting splits:', error);
                Alert.alert('Error', 'Failed to get bill splits');
              }
            }}
            className="flex-1 bg-green-500 p-4 rounded-md"
          >
            <Text className="text-white font-semibold text-center">
              View Splits
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 pt-4 border-t border-gray-300">
          <Text className="text-lg font-bold text-center">
            Total: ₪{roomData?.items?.reduce((sum, item) => sum + parseFloat(item.price.replace(',', '.')), 0).toFixed(2)}
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.back()}
        className="bg-gray-500 p-4 rounded-md mt-4"
      >
        <Text className="text-white font-semibold text-center">Back to Camera</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoomCode;