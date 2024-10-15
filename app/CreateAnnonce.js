import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, Alert, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { uploadImage } from '../utils/common'; // Votre fonction pour uploader l'image
import { db, auth,firestore,app } from '../firebaseConfig'; // Importez auth avec db
import { collection, addDoc, doc, getFirestore, getDoc } from 'firebase/firestore'; // Importez ces fonctions
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Header from '../components/Header';
import FooterMenu from '../components/FooterMenu';
import { Ionicons, MaterialIcons } from 'react-native-vector-icons'; // Assurez-vous d'installer cette dépendance
import WebView from 'react-native-webview'; // WebView pour la vidéo
import { getAuth } from 'firebase/auth';

export default function CreateAnnounceScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaList, setMediaList] = useState([]); // Liste pour stocker plusieurs images ou vidéos
  const [videolien, setvideolien] = useState('');
  const [username, setUsername] = useState(''); // État pour stocker le nom d'utilisateur
  const router = useRouter();
  const firestore = getFirestore(app); // Initialisez Firestore
  const auth = getAuth(app); // Initialisez Firebase Auth

  // Fonction pour récupérer les données utilisateur
  const fetchUserData = async () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      // Récupérer l'UID de l'utilisateur connecté
      const userDocRef = doc(firestore, 'users', currentUser.uid);

      try {
        const docSnap = await getDoc(userDocRef); // Récupérer les données Firestore
        if (docSnap.exists()) {
          // Mettre à jour le nom d'utilisateur
          setUsername(docSnap.data().username); // Utilise l'email si le username n'existe pas
          console.log(docSnap.data().username);
        } else {
          console.error('Le document utilisateur est introuvable.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur :', error);
      }
    } else {
      console.error('Aucun utilisateur connecté.');
    }
  };

  // Utilisez useEffect pour appeler fetchUserData lors du montage du composant
  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Missing fields", "Please fill in all fields before submitting.");
      return;
    }

    let uploadedMediaUrls = [];
    for (let media of mediaList) {
      try {
        // Uploader chaque fichier et obtenir l'URL publique
        const uploadedUrl = await uploadImage(media.uri); // Cette fonction devrait retourner une URL publique Firebase
        uploadedMediaUrls.push({
          type: media.type, // Type 'image' ou 'video'
          lien: uploadedUrl, // URL publique de l'image ou vidéo téléchargée
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
      likes: {},
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
      const newMedia = {
        uri: result.assets[0].uri,
        type: mediaType,
      };

      if (mediaType === 'video') {
        newMedia.lien = result.assets[0].uri;  // Ajoutez 'lien' pour les vidéos
        const uploadedUrl = await uploadImage(newMedia.lien);
        setvideolien(uploadedUrl);
console.log(uploadedUrl);  // Vérifiez l'URL générée par Firebase

      }

      setMediaList([...mediaList, newMedia]);
    }
    setModalVisible(false);
  };

  const removeMedia = (index) => {
    const newList = mediaList.filter((_, i) => i !== index);
    setMediaList(newList);
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
          style={[styles.input, { height: hp(15), textAlignVertical: 'top' }]}
          placeholder="Description"
          value={description}
          onChangeText={(text) => setDescription(text)}
          multiline={true}
        />

        <View style={styles.mediaPreview}>
          {mediaList.map((media, index) => (
            <View key={index} style={styles.mediaItem}>
              {media.type === 'video' ? (
                <View style={styles.videoContainer}>
                  {/* Utilisation de WebView pour les vidéos */}
                  <WebView
                    source={{ uri: videolien }}  // Utilisez 'lien' pour les vidéos, qui est l'URL Firebase
                    style={styles.video}
                    javaScriptEnabled={true}
                    allowsFullscreenVideo={true}
                  />
                </View>
              ) : (
                <Image source={{ uri: media.uri }} style={styles.media} />
              )}

              <TouchableOpacity onPress={() => removeMedia(index)} style={styles.removeButton}>
                <Ionicons name="remove" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.mediaIconContainer}>
        <TouchableOpacity onPress={() => pickMedia(true, 'image')} style={styles.iconButton}>
          <Ionicons name="camera" size={30} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickMedia(false, 'image')} style={styles.iconButton}>
          <Ionicons name="images" size={30} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickMedia(false, 'video')} style={styles.iconButton}>
          <MaterialIcons name="video-library" size={30} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickMedia(true, 'video')} style={styles.iconButton}>
          <Ionicons name="videocam" size={30} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <View style={styles.footerButtons}>
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerContainer}>
        <FooterMenu />
      </View>
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
    paddingBottom: 80,
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
  mediaPreview: {
    marginBottom: hp(3),
    alignItems: 'center',  // Centre le contenu horizontalement
  },
  mediaItem: {
    marginBottom: hp(2),
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: wp(70),
    height: hp(20),
    borderRadius: 10,  // Ajoute des coins arrondis si nécessaire
  },
  removeButton: {
    position: 'absolute',
    left: '73%',  // Ajustez la position selon vos préférences
    backgroundColor: 'red',
    padding: wp(1.2),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    marginBottom: 90,
  },
  iconButton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
    bottom: 75
  },
  submitButton: {
    backgroundColor: '#9370db',
    padding: 15,
    borderRadius: 50,
    width: wp(40),
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 50,
    width: wp(40),
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: wp(100),
  },
  videoContainer: {
    width: wp(70),
    height: hp(20),
    borderRadius: 10,
    overflow: 'hidden',  // Assurez-vous que la vidéo ne dépasse pas de la zone
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
