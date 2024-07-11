import { Feather, Octicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar'
import React, { useRef, useState } from 'react'
import { View, Text, Alert, Image, Pressable, TextInput, TouchableOpacity } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';  // Assurez-vous d'importer useRouter correctement
import Loading from '../components/Loading';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomKeyboardView from '../components/CustomKeyboardView';

export default function SignUp() {

    const router = useRouter(); // Initialisez router avec useRouter
    const [loading, setLoading] = useState(false);
    
    const emailRef = useRef(""); // Initialisez emailRef avec useRef
    const passwordRef = useRef(""); // Initialisez passwordRef avec useRef
    const usernameRef = useRef("");
    const profileRef = useRef("");

    const handleRegister = async () => {
        if (!emailRef.current || !passwordRef.current || !usernameRef.current || !profileRef.current) {
            Alert.alert('Sign Up', "Please fill all the fields!");
            return;
        }
        // register process
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <CustomKeyboardView>
                <StatusBar style='dark' />
                <View style={{ paddingTop: hp(7), paddingHorizontal: wp(5) }} className="flex-1 gap-12" >
                    {/*signIn image*/}
                    <View className="items-center">
                        <Image style={{ height: hp(20) }} resizeMode='contain' source={require('../assets/images/register.png')} />
                    </View>

                    <View className="gap-10">
                        <Text style={{ fontSize: hp(4) }} className="font-bold tracking-wider text-center text-neutral-800">Sign Up</Text>
                        {/*inputs*/}
                        <View className="gap-4">
                            <View style={{ height: hp(7) }} className="flex-row gap-4 bg-neutral-100 items-center rounded-xl" >
                                <Feather name='user' size={hp(2.7)} color="gray" />
                                <TextInput
                                    onChange={value => usernameRef.current = value}
                                    style={{ fontSize: hp(2) }}
                                    className="flex-1 font-semibold text-neutral-700"
                                    placeholder='Username'
                                    placeholderTextColor={'gray'}
                                />
                            </View>
                            <View style={{ height: hp(7) }} className="flex-row gap-4 bg-neutral-100 items-center rounded-xl" >
                                <Octicons name='mail' size={hp(2.7)} color="gray" />
                                <TextInput
                                    onChange={value => emailRef.current = value}
                                    style={{ fontSize: hp(2) }}
                                    className="flex-1 font-semibold text-neutral-700"
                                    placeholder='Email adress'
                                    placeholderTextColor={'gray'}
                                />
                            </View>
                           
                                <View style={{ height: hp(7) }} className="flex-row gap-4 bg-neutral-100 items-center rounded-xl" >
                                    <Octicons name='lock' size={hp(2.7)} color="gray" />
                                    <TextInput
                                        onChange={value => passwordRef.current = value}
                                        style={{ fontSize: hp(2) }}
                                        className="flex-1 font-semibold text-neutral-700"
                                        placeholder='Password'
                                        secureTextEntry
                                        placeholderTextColor={'gray'}
                                    />
                                </View>
                                <View style={{ height: hp(7) }} className="flex-row gap-4 bg-neutral-100 items-center rounded-xl" >
                                <Feather name='image' size={hp(2.7)} color="gray" />
                                <TextInput
                                    onChange={value => profileRef.current = value}
                                    style={{ fontSize: hp(2) }}
                                    className="flex-1 font-semibold text-neutral-700"
                                    placeholder='Profile url'
                                    placeholderTextColor={'gray'}
                                />
                            </View>
                            {/*submit button*/}

                            <View>
                                {loading ? (
                                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                        <Loading size={hp(6.5)} />
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleRegister}
                                        style={{ height: hp(6.5), backgroundColor: '#6366F1', borderRadius: 15, justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        <Text style={{ fontSize: hp(2.7), color: 'white', fontWeight: 'bold', letterSpacing: 1 }}>
                                            Sign Up
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/*submit button*/}

                            <View className="flex-row justify-center">
                                <Text style={{ fontSize: hp(1.8) }} className="font-semibold text-neutral-500">Already have an account? </Text>
                                <Pressable onPress={() => router.push('signIn')}>
                                    <Text style={{ fontSize: hp(1.8) }} className="font-bold text-indigo-500">Sign In</Text>
                                </Pressable>
                            </View>

                        </View>

                    </View>
                </View>
            </CustomKeyboardView>
        </GestureHandlerRootView>
    );
}
