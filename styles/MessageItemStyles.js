// MessageItemStyles.js
import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
    currentUserContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: hp(1.5),
        marginRight: wp(3),
    },
    otherUserContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: hp(1.5),
        marginLeft: wp(3),
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentUserMessage: {
        maxWidth: wp(70),
        alignSelf: 'flex-end',
        padding: hp(1),
        borderRadius: hp(1),
        backgroundColor: 'white',
        borderColor: '#d1d5db',
        borderWidth: 1,
    },
    otherUserMessage: {
        maxWidth: wp(70),
        alignSelf: 'flex-start',
        padding: hp(1),
        borderRadius: hp(1),
        backgroundColor: '#e0e7ff',
        borderColor: '#4f46e5',
        borderWidth: 1,
    },
    messageText: {
        fontSize: hp(1.9),
    },
    messageTime: {
        fontSize: hp(1.5),
        color: '#6b7280',
        marginTop: hp(0.5),
    },
    statusContainer: {
        marginLeft: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
    },
    readCircle: {
        width: wp(2),
        height: wp(2),
        borderRadius: wp(1),
        backgroundColor: 'blue',
    },
    unreadCircle: {
        width: wp(2),
        height: wp(2),
        borderRadius: wp(1),
        borderWidth: 1,
        borderColor: 'blue',
        backgroundColor: 'transparent',
    },
    menuOptions: {
        optionsContainer: {
            width: wp(60),
            borderRadius: hp(1),
            backgroundColor: 'white',
            borderColor: '#d1d5db',
            borderWidth: 1,
            paddingVertical: hp(1),
        },
    },
    reactMenuOptions: {
        optionsContainer: {
            flexDirection: 'row',
            borderRadius: hp(1),
            backgroundColor: 'white',
            borderColor: '#d1d5db',
            borderWidth: 1,
            paddingVertical: hp(1),
            paddingHorizontal: wp(2),
            marginTop: hp(1),
        },
    },
    emoji: {
        fontSize: hp(2.5),
        marginHorizontal: wp(1),
    },
    reactIcon: {
        marginLeft: wp(1),
    },
});

export default styles;
