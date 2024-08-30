// ChatRoomHeader.js

import { Entypo, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function ChatRoomHeader({ user }) {
  const router = useRouter();

  const handleProfilePress = () => {
    if (user?.userId) {
      router.push(`/Profile?userId=${user.userId}`); // Use query params to pass userId
    } else {
      console.error("User ID is not available.");
    }
  };

  return (
    <Stack.Screen
      options={{
        title: '',
        headerShadowVisible: false,
        headerLeft: () => (
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => router.back()}>
                <Entypo name="chevron-left" size={hp(4)} color="#737373" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleProfilePress} style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={{ uri: user?.profileUrl || "https://www.globalfabrications.in/images/user-Icon.jpg" }} // Ensure profileUrl is a valid URI
                  style={{ height: hp(4.5), aspectRatio: 1, borderRadius: 100 }}
                />
                <Text style={{ fontSize: hp(2.5) }} className="text-neutral-k700 font-medium">
                  {user?.username}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ),
        headerRight: () => (
          <View className="flex-row items-center gap-8">
            <Ionicons name="call" size={hp(2.8)} color={'#737373'} />
            <Ionicons name="videocam" size={hp(2.8)} color={'#737373'} />
          </View>
        )
      }}
    />
  )
}
