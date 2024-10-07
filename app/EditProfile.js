import React, { useState, useRef } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity, Image, Modal, StyleSheet, Button } from "react-native";
import { useAuth } from "../context/authContext";
import { updateUserProfile, uploadImage, deleteOldImage, sendPasswordReset } from "../utils/common";
import { Entypo } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import Loading from '../components/Loading';
import Header from "../components/Header";

export default function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const { username, email, profileUrl, userId } = useLocalSearchParams();

  const [profileImage, setProfileImage] = useState(user?.profileUrl);

  const emailRef = useRef(email || "");
  const usernameRef = useRef(username || "");
  const oldProfileImageRef = useRef(profileUrl || ""); // Référence à l'ancienne image

  const handleUpdateProfile = async () => {
    if (!emailRef.current || !usernameRef.current) {
      Alert.alert("Profile Update", "Please fill all the fields!");
      return;
    }

    setLoading(true);

    try {
      const response = await updateUserProfile(userId, {
        email: emailRef.current,
        username: usernameRef.current,
        profileUrl: profileImage
      });

      if (response.success) {
        Alert.alert("Profile Update", "Profile updated successfully!", [
          {
            text: "OK",
            onPress: () => router.push(`/Profile?userId=${user.userId}&username=${usernameRef.current}&email=${emailRef.current}&profileUrl=${profileImage}`)
          }
        ]);
        setUser(response.data);
      } else {
        Alert.alert("Profile Update", response.msg);
      }
    } catch (error) {
      Alert.alert("Profile Update", "An error occurred while updating the profile.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (fromCamera) => {
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    }

    if (!result.canceled) {
      try {
        await deleteOldImage(oldProfileImageRef.current);
        const uploadedImageUrl = await uploadImage(result.assets[0].uri);
        if (uploadedImageUrl) {
          setProfileImage(uploadedImageUrl);
        } else {
          Alert.alert("Image Upload", "Failed to upload image. Please try again.");
        }
      } catch (error) {
        Alert.alert("Image Upload", "An error occurred during the image upload.");
      }
    }
    setModalVisible(false);
  };

  const handlePasswordReset = async () => {
    setLoading(true);

    try {
      const success = await sendPasswordReset(emailRef.current);
      if (success) {
        Alert.alert("Password Reset", "An email with instructions to reset your password has been sent.");
      } else {
        Alert.alert("Password Reset", "Failed to send reset email. Please try again.");
      }
    } catch (error) {
      Alert.alert("Password Reset", "An error occurred while sending the reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{paddingTop:20,marginBottom:40}}>
       <Header onGoBack={() => router.back()} content="Edit Profile"/>
       </View>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: profileImage || "https://www.globalfabrications.in/images/user-Icon.jpg" }}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editImageButton} onPress={() => setModalVisible(true)}>
          <Entypo name="camera" size={hp(3)} color="white" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        defaultValue={email}
        onChangeText={(text) => (emailRef.current = text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        defaultValue={username}
        onChangeText={(text) => (usernameRef.current = text)}
      />

      {loading ? (
        <Loading size={hp(6.5)} />
      ) : (
        <TouchableOpacity onPress={handleUpdateProfile} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Save changes</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <Loading size={hp(6.5)} />
      ) : (
        <TouchableOpacity onPress={handlePasswordReset} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Change Password</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Choose an option</Text>
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => pickImage(true)} style={styles.iconButton}>
                <Entypo name="camera" size={hp(5)} color="#4267B2" />
                <Text style={styles.iconLabel}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => pickImage(false)} style={styles.iconButton}>
                <Entypo name="image" size={hp(5)} color="#4267B2" />
                <Text style={styles.iconLabel}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.iconButton}>
                <Entypo name="cross" size={hp(5)} color="red" />
                <Text style={{
                  marginTop: hp(0.5),
                  fontSize: hp(2),
                  color: 'red',
                  fontWeight: 'bold'
                }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: hp(4),
    fontWeight: "bold",
    marginBottom: hp(3),
    textAlign: 'center',
  },
  input: {
    height: hp(7),
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: hp(2),
    paddingLeft: wp(5),
    fontSize: hp(2),
    backgroundColor: 'white',
  },
  submitButton: {
    height: hp(6.5),
    backgroundColor: '#4267B2',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
  },
  submitButtonText: {
    fontSize: hp(2.7),
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  profileImage: {
    width: hp(20),
    height: hp(20),
    borderRadius: hp(10),
    marginBottom: hp(1),
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: wp(30), // Ajuste la position à droite
    backgroundColor: '#4267B2', // Couleur de fond modifiée
    borderRadius: 15,
    padding: 8, // Augmenter le padding pour agrandir le bouton
    width: wp(13), // Largeur du bouton
    height: hp(6), // Hauteur du bouton
    justifyContent: 'center', // Centrer l'icône verticalement
    alignItems: 'center', // Centrer l'icône horizontalement
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    marginBottom: hp(2),
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: hp(2),
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLabel: {
    marginTop: hp(0.5),
    fontSize: hp(2),
    color: '#4267B2',
    fontWeight: 'bold',
  },
});
