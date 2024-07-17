import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../../context/authContext';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ChatListe from '../../components/ChatList';
import Loading from '../../components/Loading';
import { userRef } from '../../firebaseConfig';
import { query, where, getDocs } from 'firebase/firestore';

export default function Home() {
    const { logout, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.userId) {
            getUsers();
        } else {
            setLoading(false);
        }
    }, [user]);

    const getUsers = async () => {
        try {
            console.log("Fetching users...");
            if (!user?.userId) {
                throw new Error("User UID is undefined");
            }
            const q = query(userRef, where('userId', '!=', user.userId));
            const querySnapshot = await getDocs(q);
            let data = [];
            querySnapshot.forEach(doc => {
                data.push({ ...doc.data(), id: doc.id });
            });
            console.log("Users fetched:", data);
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert("Error", `Error fetching users: ${error.message}`);
            setLoading(false);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <StatusBar style="light" />
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Loading size={hp(10)} />
                    </View>
                ) : (
                    <ChatListe currentUser={user} users={users} />
                )}
            </View>
        </GestureHandlerRootView>
    );
}
