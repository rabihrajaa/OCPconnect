import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, Alert, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { uploadImage } from '../utils/common'; // Votre fonction pour uploader l'image
import { db, auth } from '../firebaseConfig'; // Importez auth avec db
import { collection, addDoc } from 'firebase/firestore'; // Importez ces fonctions
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Header from '../components/Header';
import FooterMenu from '../components/FooterMenu';

export default function CreateAnnounceScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaList, setMediaList] = useState([]); // Liste pour stocker plusieurs images ou vidéos
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState(''); // État pour stocker le nom d'utilisateur
  const router = useRouter();

  useEffect(() => {
    // Récupérer l'utilisateur connecté à l'authentification Firebase
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Si l'utilisateur est connecté, mettez à jour le nom d'utilisateur
      setUsername(currentUser.displayName || currentUser.email); // Utilisez displayName si disponible, sinon email
    } else {
      Alert.alert("Authentication", "No user is logged in. Please sign in first.");
      router.push("/SignIn"); // Redirigez l'utilisateur vers la page de connexion s'il n'est pas authentifié
    }
  }, []);

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Missing fields", "Please fill in all fields before submitting.");
      return;
    }

    let uploadedMediaUrls = [];
    for (let media of mediaList) {
      try {
        const uploadedUrl = await uploadImage(media.uri); // Upload chaque fichier
        uploadedMediaUrls.push({
          type: media.type, // Type 'image' ou 'video'
          lien: uploadedUrl,
        });
      } catch (error) {
        Alert.alert("Media Upload", "An error occurred while uploading media.");
        return;
      }
    }

    // Créez l'objet de nouvelle annonce avec une liste de médias
    const newAnnouncement = {
      title,
      description,
      createdAt: new Date().toISOString(),
      username: username, // Utilisation du nom d'utilisateur authentifié
      piece: uploadedMediaUrls, // Liste des médias
      likes: {
        
      },
      comments: {
        nombre: 0,
        replies: 0,
      },
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

  const pickMedia = async (fromCamera, mediaType) => {
    let result;
    const mediaOptions = {
      mediaTypes: mediaType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    };

    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync(mediaOptions);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(mediaOptions);
    }

    if (!result.canceled) {
      setMediaList([...mediaList, { uri: result.assets[0].uri, type: mediaType }]);
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
      <View style={{ paddingTop: 30 }}>
        <Header onGoBack={() => router.back()} content="Create Announcement" />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        <View style={styles.mediaContainer}>
          {/* Afficher la liste des médias sélectionnés */}
          {mediaList.map((media, index) => (
            <Image key={index} source={{ uri: media.uri }} style={styles.media} />
          ))}
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.mediaButton}>
            <Text style={styles.mediaButtonText}>Add Media</Text>
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
      </ScrollView>

      {/* Pied de page */}
      <View style={styles.footerContainer}>
        <FooterMenu />
      </View>

      {/* Modal pour le picker de médias */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Choose an option</Text>
            <TouchableOpacity onPress={() => pickMedia(true, 'image')} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pickMedia(true, 'video')} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Record Video</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pickMedia(false, 'image')} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Choose from Gallery (Image)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pickMedia(false, 'video')} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Choose from Gallery (Video)</Text>
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
    backgroundColor: 'white',
  },
  scrollContainer: {
    padding: wp(5),
    paddingBottom: 80, // Ajouter un espace pour éviter la superposition avec le pied de page
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
  mediaContainer: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  media: {
    width: wp(50),
    height: hp(20),
    marginBottom: hp(1),
  },
  mediaButton: {
    backgroundColor: '#6366F1',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(10),
    borderRadius: 10,
  },
  mediaButtonText: {
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
    backgroundColor: '#f44336',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(10),
    borderRadius: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: hp(2.2),
    fontWeight: 'bold',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: wp(80),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: wp(5),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    marginBottom: hp(2),
  },
  modalButton: {
    backgroundColor: '#2196F3',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: 10,
    marginBottom: hp(1.5),
  },
  modalButtonText: {
    color: 'white',
    fontSize: hp(2),
  },
  modalButtonCancel: {
    backgroundColor: '#f44336',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: 10,
  },
  modalButtonCancelText: {
    color: 'white',
    fontSize: hp(2),
  },
});
