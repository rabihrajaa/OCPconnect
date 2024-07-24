import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Supprime un message pour l'utilisateur actuel en mettant à jour l'ID de l'expéditeur à null.
 * @param {string} roomId - ID de la salle où le message est stocké.
 * @param {string} messageId - ID du message à supprimer.
 */
export const deleteMessageForMe = async (roomId, messageId) => {
    if (!roomId || !messageId) {
        console.error("Invalid parameters for deleting message for me:", { roomId, messageId });
        return;
    }
    
    try {
        const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
        await updateDoc(messageRef, { userId: null });
        console.log(`Message ${messageId} updated for current user in room ${roomId}`);
    } catch (error) {
        console.error('Error deleting message for me: ', error);
    }
};

/**
 * Supprime un message pour tout le monde (expéditeur et récepteur) de la base de données.
 * @param {string} roomId - ID de la salle où le message est stocké.
 * @param {string} messageId - ID du message à supprimer.
 */
export const deleteMessageForEveryone = async (roomId, messageId) => {
    if (!roomId || !messageId) {
        console.error("Invalid parameters for deleting message for everyone:", { roomId, messageId });
        return;
    }
    
    try {
        const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
        await deleteDoc(messageRef);
        console.log(`Message ${messageId} deleted for everyone in room ${roomId}.`);
    } catch (error) {
        console.error('Error deleting message for everyone: ', error);
    }
};
    