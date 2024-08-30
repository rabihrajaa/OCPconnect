import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authContext";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { username, email, profileUrl, userId } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [currentProfileUrl, setCurrentProfileUrl] = useState(user.profileUrl);

  // useEffect(() => {
  //   setCurrentProfileUrl(profileUrl || user.profileUrl);
  // }, [profileUrl, user.profileUrl]);

  const handleImageError = () => {
    setCurrentProfileUrl("https://cdn.vectorstock.com/i/500x500/50/29/user-icon-male-person-symbol-profile-avatar-vector-20715029.jpg");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContainer}>
      <View style={[styles.profileHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.push(`/(app)/home`)} style={styles.backButton}>
          <Entypo name="chevron-left" size={hp(4)} color="#737373" />
        </TouchableOpacity>
        <Image 
          source={{ uri: currentProfileUrl || "https://www.globalfabrications.in/images/user-Icon.jpg" }}
          style={styles.profileImage} 
          onError={handleImageError}
        />
        <Text style={styles.name}>{username || "Unknown User"}</Text>
        <View style={styles.infoContainer}>
          <View style={styles.info}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="email" size={24} color="#007BFF" />
            </View>
            <Text style={styles.infoText}>{email || "example@gmail.com"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Edit Profile"
          onPress={() => router.push(`/EditProfile?userId=${user.userId}&username=${username}&email=${email}&profileUrl=${currentProfileUrl}`)}
          color="#007BFF"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollViewContainer: {
    paddingVertical: 20,
  },
  profileHeader: {
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#D3D3D3",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 10,
  },
  profileImage: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D3D3D3",
  },
  name: {
    fontSize: hp(3),
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoContainer: {
    width: "80%",
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
});
