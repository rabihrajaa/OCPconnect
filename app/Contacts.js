import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import { query, getDocs } from 'firebase/firestore';
import { userRef } from '../firebaseConfig';
import FooterMenu from './../components/FooterMenu';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from "expo-router";
import ChatItem from './../components/ChatItem'; // Importez le composant ChatItem ici
import { Ionicons } from '@expo/vector-icons'; // Importation de l'icône
import Header from '../components/Header';

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
            <View style={{ paddingTop: 30,marginBottom:20 }}>
                    <Header onGoBack={() => router.push(`/(app)/home`)} content="Contacts" />
                </View>
            <View style={styles.container}>

                {/* Barre de recherche avec icône */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={24} color="#4267B2" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search user.."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

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

                <View style={{ position: 'absolute', bottom: 0, width: '112%', height: 60 }} >
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25, // Rounded corners
        marginBottom: 20,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        shadowColor: '#000', // Adding shadow for depth
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3, // For Android shadow
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333', // Darker text for better readability
    },
});

export default Contacts;
