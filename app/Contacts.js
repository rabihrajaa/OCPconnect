import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import { query, getDocs } from 'firebase/firestore';
import { userRef } from '../firebaseConfig';
import FooterMenu from './../components/FooterMenu';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from "expo-router";
import ChatItem from './../components/ChatItem'; // Importez le composant ChatItem ici

const Contacts = ({ currentUser }) => {
    const [contacts, setContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredContacts, setFilteredContacts] = useState([]);
    const router = useRouter(); 

    useEffect(() => {
        const fetchContacts = async () => {
            const q = query(userRef); 
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach(doc => {
                data.push({ ...doc.data(), id: doc.id });
            });
            setContacts(data);
            setFilteredContacts(data); 
        };

        fetchContacts();
    }, []);

    const filterContacts = (query) => {
        const filtered = contacts.filter(contact =>
            contact.username.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredContacts(filtered);
    };

    useEffect(() => {
        filterContacts(searchQuery); 
    }, [searchQuery]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Text style={styles.title}>Contacts</Text>
                
                {/* Barre de recherche */}
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un utilisateur"
                    value={searchQuery}
                    onChangeText={setSearchQuery} 
                />

                <FlatList
                    data={filteredContacts}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <ChatItem
                            item={item}
                            router={router} 
                            currentUser={currentUser} // Passer l'utilisateur actuel pour la comparaison
                        />
                    )}
                />

                <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 60 }} >
                    <FooterMenu />
                </View>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
});

export default Contacts;
