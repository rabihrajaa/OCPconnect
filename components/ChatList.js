import React, { useEffect, useState } from "react";
import { View, FlatList, Text, TextInput, StyleSheet } from "react-native";
import ChatItem from "./ChatItem";
import { useRouter } from "expo-router";
import { collection, query, orderBy, onSnapshot, where, limit } from "firebase/firestore";
import { db } from '../firebaseConfig';  // Assurez-vous d'avoir configuré Firebase correctement

export default function ChatListe({ users, currentUser }) {
    const router = useRouter();
    const [sortedUsers, setSortedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // État pour la recherche
    const [filteredUsers, setFilteredUsers] = useState([]); // État pour les utilisateurs filtrés

    useEffect(() => {
        const unsubscribeListeners = [];

        const fetchAndListenToMessages = async () => {
            const userWithLastMessage = await Promise.all(
                users.map(async (user) => {
                    const roomId = generateRoomId(currentUser.userId, user.userId);
                    const q = query(
                        collection(db, "rooms", roomId, "messages"),
                        orderBy("createdAt", "desc"),
                        limit(1)
                    );

                    let lastMessageDate = null;
                    const unsubscribe = onSnapshot(q, (querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            lastMessageDate = doc.data().createdAt;

                            setSortedUsers((prevUsers) => {
                                const updatedUsers = prevUsers.map((u) =>
                                    u.userId === user.userId ? { ...u, lastMessageDate } : u
                                );

                                return updatedUsers.sort((a, b) => {
                                    if (!a.lastMessageDate) return 1;
                                    if (!b.lastMessageDate) return -1;
                                    return b.lastMessageDate.seconds - a.lastMessageDate.seconds;
                                });
                            });
                        });
                    });

                    unsubscribeListeners.push(unsubscribe);
                    return { ...user, lastMessageDate };
                })
            );

            setSortedUsers(userWithLastMessage);
        };

        fetchAndListenToMessages();

        return () => {
            unsubscribeListeners.forEach((unsubscribe) => unsubscribe());
        };
    }, [users, currentUser]);

    // Fonction de filtrage
    const filterUsers = (query) => {
        const filtered = sortedUsers.filter(user =>
            user.username.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    useEffect(() => {
        filterUsers(searchQuery); // Appliquer le filtre à chaque changement de recherche
    }, [searchQuery, sortedUsers]);

    if (!filteredUsers || filteredUsers.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No users available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Barre de recherche */}
            <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un utilisateur"
                value={searchQuery}
                onChangeText={setSearchQuery} // Mettre à jour l'état de la recherche
            />

            <FlatList
                data={filteredUsers}
                contentContainerStyle={{ flexGrow: 1, paddingVertical: 25 }}
                keyExtractor={(item) => item.id?.toString() || item.userId}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <ChatItem 
                        noBorder={index + 1 === filteredUsers.length} 
                        router={router} 
                        currentUser={currentUser} 
                        item={item} 
                        index={index} 
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
});

// Fonction pour générer un roomId basé sur les deux userIds
const generateRoomId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}-${sortedIds[1]}`;
};
