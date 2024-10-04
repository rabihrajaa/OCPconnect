import React, { useState } from 'react';
import { View, Text, TextInput, Image, Alert, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { uploadImage } from '../utils/common'; // Votre fonction pour uploader l'image
import { db } from '../firebaseConfig'; // Importez votre configuration Firebase
import { collection, addDoc } from 'firebase/firestore'; // Importez ces fonctions
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function CreateAnnounceScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Missing fields", "Please fill in all fields before submitting.");
      return;
    }

    let uploadedImageUrl = null;
    if (image) {
      try {
        uploadedImageUrl = await uploadImage(image);
      } catch (error) {
        Alert.alert("Image Upload", "An error occurred while uploading the image.");
        return;
      }
    }

    // Créez l'objet de nouvelle annonce
    const newAnnouncement = {
      title,
      description,
      image: uploadedImageUrl,
      createdAt: new Date().toISOString(),
    };

    try {
      // Ajoutez l'annonce à la collection Firestore
      await addDoc(collection(db, 'annonces'), newAnnouncement);
      Alert.alert("Announcement Created", "Your announcement has been successfully created!", [
        { text: "OK", onPress: () => router.push("/Annonces") },
      ]);
    } catch (error) {
      Alert.alert("Error", "An error occurred while creating the announcement.");
      console.error("Error adding document: ", error);
    }
  };

  const pickImage = async (fromCamera) => {
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel",
      "Are you sure you want to discard this announcement?",
      [
        { text: "No" },
        { text: "Yes", onPress: () => router.push("/Annonces") },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Announcement</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={(text) => setTitle(text)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={(text) => setDescription(text)}
        multiline={true}
        numberOfLines={4}
      />

      <View style={styles.imageContainer}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>Pick an Image</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Choose an option</Text>
            <TouchableOpacity onPress={() => pickImage(true)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pickImage(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButtonCancel}>
              <Text style={styles.modalButtonCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(5),
    backgroundColor: 'white',
  },
  title: {
    fontSize: hp(3),
    fontWeight: 'bold',
    marginBottom: hp(3),
    textAlign: 'center',
  },
  input: {
    height: hp(7),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: hp(2),
    paddingHorizontal: wp(3),
    fontSize: hp(2),
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  image: {
    width: wp(50),
    height: hp(20),
    marginBottom: hp(1),
  },
  imageButton: {
    backgroundColor: '#6366F1',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(10),
    borderRadius: 10,
  },
  imageButtonText: {
    color: 'white',
    fontSize: hp(2.2),
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(10),
    borderRadius: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: hp(2.2),
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(10),
    borderRadius: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: hp(2.2),
    fontWeight: 'bold',
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
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    marginBottom: hp(2),
  },
  modalButton: {
    marginBottom: hp(1),
    padding: hp(1),
    backgroundColor: '#6366F1',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: hp(2.2),
  },
  modalButtonCancel: {
    marginTop: hp(2),
  },
  modalButtonCancelText: {
    color: 'red',
    fontSize: hp(2.2),
  },
});
