import React, { useEffect, useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from 'expo-image';
import { blurhash } from "../utils/common";
import { useAuth } from "../context/authContext";
import { Menu, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { MenuItem } from "./CustomMenuItems";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ios = Platform.OS === 'ios';

export default function HomeHeader() {
  const { top } = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const router = useRouter();
  // Local state to manage profile image
  const [currentProfileUrl, setCurrentProfileUrl] = useState(null);

  // Fetch the latest profile image URL when the component mounts or when profileUrl changes
  useEffect(() => {
    if (user?.profileUrl) {
      setCurrentProfileUrl(user.profileUrl);
    }
  }, [user]);

  const handleProfile = () => {
    // Ensure userId exists before navigating
    if (user?.userId) {
      console.log('Navigating to Profile with userId:', user.userId);
      router.push(`/Profile?userId=${user.userId}&username=${user.username}&email=${user.email}&profileUrl=${user.profileUrl}`);
    } else {
      console.error("User ID is not available.");
    }
  };

  const handleLogout = async () => {
    await logout();
  }

  return (
    <View style={{ paddingTop: ios ? top : top + 10,backgroundColor: '#4267B2' }} className="flex-row justify-between px-5  pb-6 rounded-b-3xl shadow">
      <View>
        <Text style={{ fontSize: hp(3) }} className="font-medium text-white">OCPconnect</Text>
      </View>

      <View>
        <Menu>
          <MenuTrigger>
            <Image
              style={{ height: hp(4.3), aspectRatio: 1, borderRadius: 100 }}
              source={{ uri: currentProfileUrl || "https://www.globalfabrications.in/images/user-Icon.jpg" }} // Use the currentProfileUrl state
              placeholder={blurhash}
              transition={500}
            />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: {
                borderRadius: 10,
                marginTop: 40,
                marginLeft: -30,
                backgroundColor: 'white',
                shadowOpacity: 1,
                shadowOffset: { width: 0, height: 0 },
                width: 160
              }
            }}
          >
            <MenuItem
              text="Profile"
              action={handleProfile}
              value={null}
              icon={<Feather name="user" size={hp(2.5)} color="#737373" />}
            />
            <Divider />
            <MenuItem
              text="Sign Out"
              action={handleLogout}
              value={null}
              icon={<AntDesign name="logout" size={hp(2.5)} color="#737373" />}
            />
          </MenuOptions>
        </Menu>
      </View>
    </View>
  )
}

const Divider = () => {
  return (
    <View className="p-[1px] w-full bg-neutral-200"></View>
  )
}
