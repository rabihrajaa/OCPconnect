import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Assurez-vous que cela pointe vers votre configuration Firebase
import { getStorage, ref, uploadBytes, getDownloadURL,deleteObject } from "firebase/storage";

import { getAuth, sendPasswordResetEmail ,sendEmailVerification, createUserWithEmailAndPassword} from "firebase/auth";


export const sendResetPasswordEmail = async (email) => {
    const auth = getAuth();
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error('Failed to send reset password email:', error.message);
        return { success: false, msg: 'Failed to send reset password email. Please try again.' };
    }
};


export const sentVerificationEmail = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      await sendEmailVerification(user);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error.message);
      return false;
    }
  } else {
    console.error('No user is logged in to send a verification email.');
    return false;
  }
};

export const sendPasswordReset = async (email) => {
  const auth = getAuth();
  try {
    await sendPasswordResetEmail(auth, email);
    return true; // Indique que l'e-mail de réinitialisation a été envoyé avec succès
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false; // Indique qu'il y a eu un problème lors de l'envoi de l'e-mail
  }
};

/**
 * Supprime une ancienne image du stockage Firebase en utilisant son URL.
 * 
 * @param {string} imageUrl - L'URL complète de l'image à supprimer.
 * @returns {Promise<boolean>} - Retourne `true` si l'image a été supprimée ou n'existe pas, sinon `false`.
 */
export const deleteOldImage = async (imageUrl) => {
  if (!imageUrl) return true;

  const storage = getStorage();
  const storageRef = ref(storage, imageUrl);

  try {
    // Essayer de récupérer l'URL de téléchargement pour vérifier l'existence de l'image
    await getDownloadURL(storageRef);

    // Si l'image existe, la supprimer
    await deleteObject(storageRef);
    console.log("Old profile image deleted successfully.");
    return true;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      // Si l'image n'existe pas, retourner true sans rien faire
      console.log("Image not found, nothing to delete.");
      return true;
    } else {
      // Gérer les autres erreurs
      console.error("Error deleting old profile image:", error);
      return false;
    }
  }
};



export const uploadImage = async (uri) => {
  try {
    // Conversion de l'URI en un blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Générer un nom de fichier unique en utilisant l'heure actuelle
    const uniqueId = Date.now().toString();

    // Créer une référence au fichier dans Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, `images/${uniqueId}`);

    // Téléchargement du fichier sur Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);

    // Récupérer l'URL téléchargeable du fichier
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw new Error("Failed to upload image");
  }
};



export const updateUserProfile = async (userId, updatedData) => {
  try {
    // Référence du document utilisateur
    const userDocRef = doc(db, "users", userId);

    // Mise à jour du document avec les nouvelles données
    await updateDoc(userDocRef, updatedData);

    console.log("Profile updated successfully");
    return { success: true, data: updatedData };
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return { success: false, msg: error.message };
  }
};


export const blurhash ='|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export const getRoomId=(userId1,userId2)=>{
    const sortedIds=[userId1,userId2].sort();
    const roomId=sortedIds.join('-');
    return roomId;
}

export const formatDate = date => {
    var day = date.getDate();
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var month = monthNames[date.getMonth()];
    var formattedDate = day + " " + month;
    return formattedDate;
}




  
  
