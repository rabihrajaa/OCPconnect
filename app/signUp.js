import React, { useRef, useState } from 'react';
import { View, Text, Alert, Image, Pressable, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Feather, Octicons, Entypo } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as wd } from 'react-native-responsive-screen';
import Loading from '../components/Loading';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, sentEmailverification } from '../utils/common';

export default function SignUp() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  const emailRef = useRef("");
  const passwordRef = useRef("");
  const confirmPasswordRef = useRef("");
  const usernameRef = useRef("");

  const handleRegister = async () => {
    if (!emailRef.current || !passwordRef.current || !usernameRef.current) {
      Alert.alert('Sign Up', "Please fill all the fields!");
      return;
    }

    if (passwordRef.current !== confirmPasswordRef.current) {
      Alert.alert('Sign Up', "Passwords do not match!");
      return;
    }

    setLoading(true);

    const response = await register(emailRef.current, passwordRef.current, usernameRef.current, profileImage);

    if (response.success) {
      const emailSent = await sentEmailverification(emailRef.current);
      if (emailSent) {
        Alert.alert('Sign Up', 'Please verify your email to complete the registration.');
        router.push('signIn');
      } else {
        Alert.alert('Sign Up', 'Failed to send verification email. Please try again.');
      }
    } else {
      Alert.alert('Sign Up', response.msg);
    }
    setLoading(false);
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CustomKeyboardView>
        <StatusBar style='dark' />
        <View style={{ paddingTop: wd(7), paddingHorizontal: wd(5) }} className="flex-1 gap-12">
          <View className="items-center">
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image 
                source={{ uri: profileImage || "https://www.globalfabrications.in/images/user-Icon.jpg" }} 
                style={styles.profileImage} 
              />
              <TouchableOpacity style={styles.editImageButton} onPress={() => setModalVisible(true)}>
                <Entypo name="camera" size={wd(5)} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          <View className="gap-10">
            <Text style={{ fontSize: wd(4) }} className="font-bold tracking-wider text-center text-neutral-800">Sign Up</Text>

            <View className="gap-4">
              <View style={{ height: wd(7) }} className="flex-row gap-4 bg-neutral-100 items-center rounded-xl">
                <Feather name='user' size={wd(2.7)} color="gray" />
                <TextInput
                  onChangeText={value => usernameRef.current = value}
                  style={{ fontSize: wd(2) }}
                  className="flex-1 font-semibold text-neutral-700"
                  placeholder='Username'
                  placeholderTextColor={'gray'}
                />
              </View>
              <View style={{ height: wd(7) }} className="flex-row gap-4 bg-neutral-100 items-center rounded-xl">
                <Octicons name='mail' size={wd(2.7)} color="gray" />
                <TextInput
                  onChangeText={value => emailRef.current = value}
                  style={{ fontSize: wd(2) }}
                  className="flex-1 font-semibold text-neutral-700"
                  placeholder='Email address'
                  placeholderTextColor={'gray'}
                />
              </View>
              <View style={{ height: wd(7) }} className="flex-row gap-4 bg-neutral-100 items-center rounded-xl">
                <Octicons name='lock' size={wd(2.7)} color="gray" />
                <TextInput
                  onChangeText={value => passwordRef.current = value}
                  style={{ fontSize: wd(2) }}
                  className="flex-1 font-semibold text-neutral-700"
                  placeholder='Password'
                  secureTextEntry
                  placeholderTextColor={'gray'}
                />
              </View>
              <View style={{ height: wd(7) }} className="flex-row gap-4 bg-neutral-100 items-center rounded-xl">
                <Octicons name='lock' size={wd(2.7)} color="gray" />
                <TextInput
                  onChangeText={value => confirmPasswordRef.current = value}
                  style={{ fontSize: wd(2) }}
                  className="flex-1 font-semibold text-neutral-700"
                  placeholder='Confirm Password'
                  secureTextEntry
                  placeholderTextColor={'gray'}
                />
              </View>
            </View>

            <View>
              {loading ? (
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  <Loading size={wd(6.5)} />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleRegister}
                  style={{ height: wd(6.5), backgroundColor: '#6366F1', borderRadius: 15, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={{ fontSize: wd(2.7), color: 'white', fontWeight: 'bold', letterSpacing: 1 }}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row justify-center">
              <Text style={{ fontSize: wd(1.8) }} className="font-semibold text-neutral-500">Already have an account? </Text>
              <Pressable onPress={() => router.push('signIn')}>
                <Text style={{ fontSize: wd(1.8) }} className="font-bold text-indigo-500">Sign In</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Modal for Image Picker */}
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
                  <Entypo name="camera" size={wd(5)} color="#6366F1" />
                  <Text style={styles.iconLabel}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => pickImage(false)} style={styles.iconButton}>
                  <Entypo name="image" size={wd(5)} color="#6366F1" />
                  <Text style={styles.iconLabel}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.iconButton}>
                  <Entypo name="cross" size={wd(5)} color="red" />
                  <Text style={styles.iconLabel}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </CustomKeyboardView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: wd(25),
    height: wd(25),
    borderRadius: wd(12.5),
    marginBottom: wd(1),
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    padding: wd(1),
    borderRadius: wd(5),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: wp(80),
    padding: wd(5),
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: wd(4),
    fontWeight: 'bold',
    marginBottom: wd(5),
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
  },
  iconLabel: {
    marginTop: wd(1),
    fontSize: wd(2.5),
    color: '#6366F1',
  },
});
