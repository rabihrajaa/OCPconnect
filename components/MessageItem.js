import React from 'react';
import { View, Text } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function MessageItem({ message, currentUser }) {
    const isCurrentUser = currentUser?.userId === message?.userId;

    if (isCurrentUser) {
        // Message from current user
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: hp(1.5), marginRight: wp(3) }}>
                <View style={{ width: wp(80) }}>
                    <View style={{ alignSelf: 'flex-end', padding: hp(1), borderRadius: hp(1), backgroundColor: 'white', borderColor: '#d1d5db', borderWidth: 1 }}>
                        <Text style={{ fontSize: hp(1.9) }}>
                            {message?.text}
                        </Text>
                    </View>
                </View>
            </View>
        );
    } else {
        // Message from other user
        return (
            <View style={{ width: wp(80), marginLeft: wp(3), marginBottom: hp(1.5) }}>
                <View style={{ alignSelf: 'flex-start', padding: hp(1), paddingHorizontal: wp(4), borderRadius: hp(1), backgroundColor: '#e0e7ff', borderColor: '#4f46e5', borderWidth: 1 }}>
                    <Text style={{ fontSize: hp(1.9) }}>
                        {message?.text}
                    </Text>
                </View>
            </View>
        );
    }
}
