import { Octicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { View, Text, Alert, Image, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';  // Ensure you import useRouter correctly
import Loading from '../components/Loading';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';

export default function SignIn() {

    const router = useRouter(); // Initialize router with useRouter
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const emailRef = useRef(""); // Initialize emailRef with useRef
    const passwordRef = useRef(""); // Initialize passwordRef with useRef

    const handleLogin = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert('Sign In', "Please fill all the fields!");
            return;
        }
        // login process
        setLoading(true);
        const response = await login(emailRef.current, passwordRef.current);
        setLoading(false);
        console.log('sign in response: ', response);
        if (!response.success) {
            Alert.alert('Sign In', response.msg);
        }
    }

    const onSubmitForm = async () => {
        console.log('why');
        const body = {
            email: emailRef.current,
            password: passwordRef.current
        };
        console.log(body);
        await fetch("http://10.0.2.2:5000/users/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then().catch(err => {
            console.log(err)
        });
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <CustomKeyboardView>
                <StatusBar style='dark' />
                <View style={{ paddingTop: hp(8), paddingHorizontal: wp(5) }} className="flex-1 gap-12" >
                    {/*signIn image*/}
                    <View className="items-center">
                        <Image style={{ height: hp(25) }} resizeMode='contain' source={require('../assets/images/login.png')} />
                    </View>

                    <View className="gap-10">
                        <Text style={{ fontSize: hp(4) }} className="font-bold tracking-wider text-center text-neutral-800">Sign In</Text>
                        {/*inputs*/}
                        <View className="gap-4">
                            <View style={{ height: hp(7) }} className="flex-row gap-4 bg-neutral-100 items-center rounded-xl" >
                                <Octicons name='mail' size={hp(2.7)} color="gray" />
                                <TextInput
                                    onChangeText={value => emailRef.current = value}
                                    style={{ fontSize: hp(2) }}
                                    className="flex-1 font-semibold text-neutral-700"
                                    placeholder='Email address'
                                    placeholderTextColor={'gray'}
                                />
                            </View>
                            <View className="gap-3">
                                <View style={{ height: hp(7) }} className="flex-row gap-4 bg-neutral-100 items-center rounded-xl" >
                                    <Octicons name='lock' size={hp(2.7)} color="gray" />
                                    <TextInput
                                        onChangeText={value => passwordRef.current = value}
                                        style={{ fontSize: hp(2) }}
                                        className="flex-1 font-semibold text-neutral-700"
                                        placeholder='Password'
                                        secureTextEntry
                                        placeholderTextColor={'gray'}
                                    />
                                </View>
                                <Text style={{ fontSize: hp(1.8) }} className="font-semibold text-right text-neutral-500" >Forgot password?</Text>
                            </View>
                            {/*submit button*/}

                            <View>
                                {loading ? (
                                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                        <Loading size={hp(6.5)} />
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleLogin}
                                        style={{ height: hp(6.5), backgroundColor: '#6366F1', borderRadius: 15, justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        <Text style={{ fontSize: hp(2.7), color: 'white', fontWeight: 'bold', letterSpacing: 1 }}>
                                            Sign In
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/*submit button*/}

                            <View className="flex-row justify-center">
                                <Text style={{ fontSize: hp(1.8) }} className="font-semibold text-neutral-500">Don't have an account? </Text>
                                <Pressable onPress={() => router.push('signUp')}>
                                    <Text style={{ fontSize: hp(1.8) }} className="font-bold text-indigo-500">Sign Up</Text>
                                </Pressable>
                            </View>

                        </View>

                    </View>
                </View>
            </CustomKeyboardView>
        </GestureHandlerRootView>
    );
}
