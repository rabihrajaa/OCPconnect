import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';

const FooterMenu = () => {
    const navigation = useNavigation();
    const route = useRoute(); 

    // État pour savoir si le bouton "add" a été cliqué
    const [isAddClicked, setIsAddClicked] = useState(false);

    return (
        <View style={styles.container}>
            {/* Première icône - Chat */}
            <TouchableOpacity
                style={[
                    styles.menuItem,
                    route.name === 'home' && styles.activeItem,
                ]}
                onPress={() => router.replace('home')}
            >
                <MaterialIcons
                    name="chat"
                    size={24}
                    color={route.name === 'home' ? 'white' : 'black'}
                />
            </TouchableOpacity>

            {/* Deuxième icône - Contacts */}
            <TouchableOpacity
                style={[
                    styles.menuItem,
                    route.name === 'Contacts' && styles.activeItem,
                ]}
                onPress={() => navigation.navigate('Contacts')}
            >
                <MaterialIcons
                    name="people"
                    size={24}
                    color={route.name === 'Contacts' ? 'white' : 'black'}
                />
            </TouchableOpacity>

            {/* Bouton Ajouter au milieu - CreateAnnonce */}
            <TouchableOpacity
                style={[
                    styles.menuItem,
                    styles.addButton,
                    isAddClicked && styles.addButtonClicked, // Appliquer le style si cliqué
                ]}
                onPress={() => {
                    setIsAddClicked(true); // Changer l'état lorsqu'on clique sur le bouton "add"
                    navigation.navigate('CreateAnnonce');
                }}
            >
                <MaterialIcons name="add" size={30} color="white" />
            </TouchableOpacity>

            {/* Troisième icône - Annonces */}
            <TouchableOpacity
                style={[
                    styles.menuItem,
                    route.name === 'Annonces' && styles.activeItem,
                ]}
                onPress={() => navigation.navigate('Annonces')}
            >
                <MaterialIcons
                    name="assignment"
                    size={24}
                    color={route.name === 'Annonces' ? 'white' : 'black'}
                />
            </TouchableOpacity>

            {/* Quatrième icône - Appels */}
            <TouchableOpacity
                style={[
                    styles.menuItem,
                    route.name === 'Calls' && styles.activeItem,
                ]}
                onPress={() => navigation.navigate('Calls')}
            >
                <MaterialIcons
                    name="call"
                    size={24}
                    color={route.name === 'Calls' ? 'white' : 'black'}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#e3e3e4',
        borderTopWidth: 1,
        borderColor: '#bdb9b9',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#5a5a5a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
        height: 80, // Hauteur du menu
        paddingVertical: 10,
        paddingBottom:25
    },
    menuItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    activeItem: {
        width: 50,
        height: 50,
        backgroundColor: '#4267B2',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 60,
        height: 60,
        backgroundColor: '#FF0000',
        borderRadius: 30, // Cercle
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -15, // Ajuster la position
    },
    addButtonClicked: {
        backgroundColor: '#4267B2', // Changer la couleur quand cliqué
    },
});

export default FooterMenu;
