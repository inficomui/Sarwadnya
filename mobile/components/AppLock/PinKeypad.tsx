import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface PinKeypadProps {
    onPress: (key: string) => void;
    onDelete: () => void;
    biometricType?: boolean;
    onBiometricPress?: () => void;
    textColor?: string;
    borderColor?: string;
}

const keys = [
    { val: '1', sub: '' }, { val: '2', sub: 'ABC' }, { val: '3', sub: 'DEF' },
    { val: '4', sub: 'GHI' }, { val: '5', sub: 'JKL' }, { val: '6', sub: 'MNO' },
    { val: '7', sub: 'PQRS' }, { val: '8', sub: 'TUV' }, { val: '9', sub: 'WXYZ' },
    { val: 'biometric', sub: '' }, { val: '0', sub: '+' }, { val: 'backspace', sub: '' }
];

export const PinKeypad: React.FC<PinKeypadProps> = ({
    onPress,
    onDelete,
    biometricType,
    onBiometricPress,
    textColor = '#FFF',
    borderColor = 'rgba(255,255,255,0.15)'
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {keys.map((item, index) => {
                    // Biometric Key
                    if (item.val === 'biometric') {
                        return (
                            <View key="biometric-wrapper" style={styles.keyWrapper}>
                                {biometricType ? (
                                    <TouchableOpacity
                                        style={styles.actionKey}
                                        onPress={onBiometricPress}
                                        activeOpacity={0.4}
                                    >
                                        <Ionicons name="finger-print" size={32} color="#4A90E2" />
                                    </TouchableOpacity>
                                ) : <View style={styles.actionKey} />}
                            </View>
                        );
                    }

                    // Backspace Key
                    if (item.val === 'backspace') {
                        return (
                            <View key="backspace-wrapper" style={styles.keyWrapper}>
                                <TouchableOpacity
                                    style={styles.actionKey}
                                    onPress={onDelete}
                                    activeOpacity={0.4}
                                >
                                    <Ionicons name="backspace-outline" size={28} color={textColor} />
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    // Standard Number Keys
                    return (
                        <View key={item.val} style={styles.keyWrapper}>
                            <TouchableOpacity
                                style={[styles.keyCircle, { borderColor }]}
                                onPress={() => onPress(item.val)}
                                activeOpacity={0.5}
                            >
                                <Text style={[styles.keyText, { color: textColor }]}>{item.val}</Text>
                                {item.sub !== '' && (
                                    <Text style={styles.subText}>{item.sub}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignContent: 'center',
    },
    keyWrapper: {
        width: '33%',
        aspectRatio: 1, // Keeps the keys perfectly circular
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
    },
    keyCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    actionKey: {
        width: 68,
        height: 68,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyText: {
        fontSize: 28,
        fontWeight: '400',
        lineHeight: 32,
    },
    subText: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '600',
        letterSpacing: 1,
        marginTop: -1,
    },
});

















// import { Ionicons } from '@expo/vector-icons';
// import React from 'react';
// import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// const { width } = Dimensions.get('window');

// interface PinKeypadProps {
//     onPress: (key: string) => void;
//     onDelete: () => void;
//     biometricType?: boolean;
//     onBiometricPress?: () => void;
// }

// const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'biometric', '0', 'backspace'];

// export const PinKeypad: React.FC<PinKeypadProps & { textColor?: string, borderColor?: string }> = ({
//     onPress,
//     onDelete,
//     biometricType,
//     onBiometricPress,
//     textColor = '#FFF',
//     borderColor = 'rgba(255,255,255,0.2)'
// }) => {
//     return (
//         <View style={styles.container}>
//             <View style={styles.row}>
//                 {keys.map((key) => {
//                     if (key === 'biometric') {
//                         if (!biometricType) return <View key="empty" style={styles.key} />;
//                         return (
//                             <TouchableOpacity key="biometric" style={styles.key} onPress={onBiometricPress}>
//                                 <Ionicons name="finger-print" size={32} color={textColor} />
//                             </TouchableOpacity>
//                         );
//                     }
//                     if (key === 'backspace') {
//                         return (
//                             <TouchableOpacity key="backspace" style={styles.key} onPress={onDelete}>
//                                 <Ionicons name="backspace-outline" size={28} color={textColor} />
//                             </TouchableOpacity>
//                         );
//                     }
//                     return (
//                         <TouchableOpacity key={key} style={styles.key} onPress={() => onPress(key)}>
//                             <View style={[styles.keyCircle, { borderColor }]}>
//                                 <Text style={[styles.keyText, { color: textColor }]}>{key}</Text>
//                             </View>
//                         </TouchableOpacity>
//                     );
//                 })}
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         width: '100%',
//         paddingBottom: 50,
//     },
//     row: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'center',
//     },
//     key: {
//         width: width / 3 - 30,
//         height: 80,
//         justifyContent: 'center',
//         alignItems: 'center',
//         margin: 5,
//     },
//     keyCircle: {
//         width: 70,
//         height: 70,
//         borderRadius: 35,
//         backgroundColor: 'rgba(255,255,255,0.1)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: 'rgba(255,255,255,0.2)',
//     },
//     keyText: {
//         color: '#FFF',
//         fontSize: 28,
//         fontFamily: 'Inter-Medium', // Assuming font is available, fallback will happen if not
//         fontWeight: '500',
//     },
// });
