import { Image } from 'expo-image';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { blurhash } from '../utils/common';

export default function ChatItem({ item, router,noBorder }) {
    
    const openChatRoom=()=>{
        router.push({pathname: '/chatRoom',params:item});
    }
    
    return (
        <TouchableOpacity 
        onPress={openChatRoom}
        style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginHorizontal: wp(4), 
            alignItems: 'center', 
            gap: wp(3), 
            marginBottom: hp(1), 
            paddingBottom: hp(1), 
            borderBottomColor: '#E8E8E8',
            borderBottomWidth: noBorder ? 0 : 1  // Conditionally apply borderBottomWidth
        }}
        >
            {/*<Image
                source={{ uri: item?.profileUrl }}
                style={{ height: hp(6), width: hp(6), borderRadius: hp(3) }}
            />*/}
            
            <Image 
                 source={{ uri: item?.profileUrl }}
                 style={{ height: hp(6), width: hp(6), borderRadius: hp(3) }}
                 placeholder={blurhash}
                 transition={500}           
            />
            
            {/* name and last message */}
            <View style={{ flex: 1, gap: hp(0.5) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: hp(1.8), fontWeight: '600', color: '#1f2937' }}>{item?.username}</Text>
                    <Text style={{ fontSize: hp(1.6), fontWeight: '500', color: '#6b7280' }}>Time</Text>
                </View>
                <Text style={{ fontSize: hp(1.6), fontWeight: '500', color: '#6b7280' }}>Last message</Text>
            </View>
        </TouchableOpacity>
    );
}
