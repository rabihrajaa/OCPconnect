import { View, FlatList } from "react-native";
import React from "react";
import ChatItem from "./ChatItem";
import { useRouter } from "expo-router/build";

export default function ChatListe({ users,currentUser }) {
    const router=useRouter();
    return (
        <View>
            <FlatList
                data={users}
                contentContainerStyle={{ flexGrow: 1, paddingVertical: 25 }}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => <ChatItem 
                                                        noBorder={index+1 == users.length} 
                                                        router={router} 
                                                        currentUser={currentUser}
                                                        item={item} 
                                                        index={index} 
                                                />}
           
           />
        </View>
    );
}
