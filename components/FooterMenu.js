import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native'; // Ajout de useRoute
import { router } from 'expo-router';

const FooterMenu = () => {
    const navigation = useNavigation();
    const route = useRoute(); // Récupérer la route active

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.menuItem,
                    route.name === 'home' && styles.activeItem, // Appliquer les styles actifs si c'est la route actuelle
                ]}
                onPress={() => router.replace('home')}
            >
                <MaterialIcons
                    name="chat"
                    size={24}
                    color={route.name === 'home' ? 'white' : 'black'} // Changer la couleur de l'icône
                />
                <Text style={[styles.menuText, route.name === 'home' && styles.activeText]}>
                    Messages
                </Text>
            </TouchableOpacity>

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
                <Text style={[styles.menuText, route.name === 'Contacts' && styles.activeText]}>
                    Contacts
                </Text>
            </TouchableOpacity>

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
                <Text style={[styles.menuText, route.name === 'Annonces' && styles.activeText]}>
                    Annonces
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#e3e3e4',
        borderTopWidth: 3,
        borderColor: '#bdb9b9',
        borderTopLeftRadius: 20, // rounded-b-3xl
        borderTopRightRadius: 20, // rounded-b-3xl
        shadowColor: '#5a5a5a', // shadow
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
    },
    menuItem: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 30,
    },
    activeItem: {
        backgroundColor: '#7f5fed', // bg-indigo-400
    },
    menuText: {
        fontSize: 12,
        color: 'black',
    },
    activeText: {
        color: 'white', // Texte en blanc pour les éléments actifs
    },
});

export default FooterMenu;
