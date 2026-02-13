













import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppLock } from '../../context/AppLockContext';
import { useAuth } from '../../context/AuthContext';
import { AnimatedFingerprint } from './AnimatedFingerprint';
import { PatternLock } from './PatternLock';
import { PinKeypad } from './PinKeypad';

const { width, height } = Dimensions.get('window');

export const LockScreen: React.FC = () => {
    const { isLocked, lockType, validateSecret, checkBiometrics, unlock, setLockSettings, isBiometricsEnabled } = useAppLock();
    const { logout } = useAuth();

    const [pin, setPin] = useState('');
    const [isError, setIsError] = useState(false);

    const getInstructionMessage = () => {
        if (isBiometricsEnabled) {
            return lockType === 'PIN' ? "Verify identity to continue" : "Draw pattern to unlock";
        }
        return lockType === 'PIN' ? "Enter Secure PIN" : "Draw Secure Pattern";
    };

    const [statusMessage, setStatusMessage] = useState(getInstructionMessage());

    useEffect(() => {
        setStatusMessage(getInstructionMessage());
    }, [lockType, isBiometricsEnabled]);

    useEffect(() => {
        if (isLocked && isBiometricsEnabled) {
            const timer = setTimeout(() => handleBiometricAuth(), 500);
            return () => clearTimeout(timer);
        }
    }, [isLocked]);

    const handleBiometricAuth = async () => {
        const success = await checkBiometrics();
        if (success) unlock();
        else {
            setStatusMessage('Biometric not recognized');
            setTimeout(() => setStatusMessage(getInstructionMessage()), 2000);
        }
    };

    const handlePinPress = async (key: string) => {
        if (isError) return;
        if (key === 'backspace') {
            setPin(prev => prev.slice(0, -1));
            return;
        }

        const newPin = pin + key;
        if (newPin.length <= 4) setPin(newPin);

        if (newPin.length === 4) {
            const isValid = await validateSecret(newPin);
            if (isValid) {
                setPin('');
                unlock();
            } else {
                setIsError(true);
                setStatusMessage('Invalid PIN');
                setTimeout(() => {
                    setPin('');
                    setIsError(false);
                    setStatusMessage(getInstructionMessage());
                }, 800);
            }
        }
    };

    const handlePatternComplete = async (pattern: number[]) => {
        if (pattern.length < 3) {
            setStatusMessage('Pattern too short');
            setTimeout(() => setStatusMessage(getInstructionMessage()), 1500);
            return;
        }

        const isValid = await validateSecret(pattern.join(''));
        if (isValid) {
            unlock();
        } else {
            setIsError(true);
            setStatusMessage('Wrong pattern');
            setTimeout(() => {
                setIsError(false);
                setStatusMessage(getInstructionMessage());
            }, 1000);
        }
    };

    const handleLogout = () => {
        Alert.alert("Sign Out", "This will reset your security settings.", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: () => { unlock(); setLockSettings('NONE'); logout(); } }
        ]);
    };

    if (!isLocked || lockType === 'NONE') return null;

    return (
        <View style={styles.container}>
            {/* Background Decorative Element */}
            <View style={styles.bgGlow} />

            <View style={styles.content}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Ionicons
                            name={isError ? "warning" : "shield-checkmark"}
                            size={32}
                            color={isError ? "#FF4444" : "#4A90E2"}
                        />
                    </View>
                    <Text style={styles.title}>Secure Access</Text>
                    <Text style={[styles.subtitle, isError && { color: '#FF4444' }]}>
                        {statusMessage}
                    </Text>
                </View>

                {/* Main Input Area */}
                <View style={styles.inputArea}>
                    {lockType === 'PIN' ? (
                        <View style={styles.pinWrapper}>
                            <View style={styles.dotsContainer}>
                                {[...Array(4)].map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.pinDot,
                                            pin.length > i && styles.pinDotFilled,
                                            isError && styles.pinDotError
                                        ]}
                                    />
                                ))}
                            </View>
                            <PinKeypad
                                onPress={handlePinPress}
                                onDelete={() => handlePinPress('backspace')}
                                biometricType={false}
                                textColor="#FFF"
                                borderColor="rgba(255,255,255,0.15)"
                            />
                        </View>
                    ) : (
                        <PatternLock
                            onPatternComplete={handlePatternComplete}
                            error={isError}
                            dotColor="rgba(255,255,255,0.2)"
                            activeDotColor="#4A90E2"
                            lineColor="#4A90E2"
                        />
                    )}
                </View>

                {/* Footer Section */}
                <View style={styles.footer}>
                    {isBiometricsEnabled && (
                        <TouchableOpacity
                            onPress={handleBiometricAuth}
                            style={styles.biometricBtn}
                            activeOpacity={0.7}
                        >
                            <AnimatedFingerprint size={44} color="#4A90E2" />
                            <Text style={styles.biometricText}>Tap to Scan</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={handleLogout} style={styles.forgotBtn}>
                        <Text style={styles.forgotText}>Switch User or Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 99999,
        backgroundColor: '#0F1115', // Deeper, richer dark
    },
    bgGlow: {
        position: 'absolute',
        top: -100,
        alignSelf: 'center',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width,
        backgroundColor: 'rgba(74, 144, 226, 0.05)', // Subtle blue glow
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 8,
        fontWeight: '500',
    },
    inputArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 30,
        height: 20,
    },
    pinDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 15,
    },
    pinDotFilled: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
        transform: [{ scale: 1.2 }],
    },
    pinDotError: {
        backgroundColor: '#FF4444',
        borderColor: '#FF4444',
    },
    footer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    biometricBtn: {
        alignItems: 'center',
        marginBottom: 30,
    },
    biometricText: {
        color: '#4A90E2',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
        textTransform: 'uppercase',
    },
    forgotBtn: {
        padding: 10,
    },
    forgotText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontWeight: '500',
    },
});













// import { Ionicons } from '@expo/vector-icons';
// import React, { useEffect, useState } from 'react';
// import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { useAuth } from '../../context/AuthContext';

// import { useAppLock } from '../../context/AppLockContext';
// import { AnimatedFingerprint } from './AnimatedFingerprint';
// import { PatternLock } from './PatternLock';
// import { PinKeypad } from './PinKeypad';

// const { width, height } = Dimensions.get('window');

// export const LockScreen: React.FC = () => {
//     const { isLocked, lockType, validateSecret, checkBiometrics, unlock, setLockSettings, isBiometricsEnabled, biometricType } = useAppLock();
//     const { logout } = useAuth();

//     const [pin, setPin] = useState('');
//     const [isError, setIsError] = useState(false);
//     const getInstructionMessage = () => {
//         if (isBiometricsEnabled) {
//             return lockType === 'PIN'
//                 ? "Use Fingerprint or PIN to unlock"
//                 : "Use Fingerprint or Pattern to unlock";
//         }
//         return lockType === 'PIN'
//             ? "Enter PIN to unlock"
//             : "Draw Pattern to unlock";
//     };

//     const [statusMessage, setStatusMessage] = useState(getInstructionMessage());

//     // Update message when settings change
//     useEffect(() => {
//         setStatusMessage(getInstructionMessage());
//     }, [lockType, isBiometricsEnabled]);

//     useEffect(() => {
//         if (isLocked && isBiometricsEnabled) {
//             // Small delay to allow UI to mount before invoking system modal
//             const timer = setTimeout(() => {
//                 handleBiometricAuth();
//             }, 500);
//             return () => clearTimeout(timer);
//         }
//     }, [isLocked, isBiometricsEnabled]);

//     const handleBiometricAuth = async () => {
//         // Don't change status message to "Scanning..." to keep the instruction visible
//         // setStatusMessage('Scanning...');
//         const success = await checkBiometrics();
//         if (success) {
//             unlock();
//         } else {
//             setStatusMessage('Authentication failed');
//             // Reset to instruction after delay
//             setTimeout(() => setStatusMessage(getInstructionMessage()), 2000);
//         }
//     };

//     const handlePinPress = async (key: string) => {
//         if (key === 'backspace') {
//             setPin(prev => prev.slice(0, -1));
//             return;
//         }

//         // Safety check just in case, though PinPad handles this separation
//         if (key === 'biometric') {
//             handleBiometricAuth();
//             return;
//         }

//         const newPin = pin + key;
//         setPin(newPin);

//         if (newPin.length >= 4) {
//             const isValid = await validateSecret(newPin);
//             if (isValid) {
//                 setPin('');
//                 unlock();
//             } else if (newPin.length >= 6) { // Auto clear after 6 if fail
//                 setIsError(true);
//                 setTimeout(() => {
//                     setPin('');
//                     setIsError(false);
//                 }, 500);
//             }
//         }
//     };

//     const handlePatternComplete = async (pattern: number[]) => {
//         const patternString = pattern.join('');
//         const isValid = await validateSecret(patternString);
//         if (isValid) {
//             unlock();
//         } else {
//             setIsError(true);
//             // setStatusMessage('Wrong Pattern'); // Optional: keep status generic or specific
//             // Since we use dynamic messaging, maybe just flash error state?
//             // Actually, showing "Wrong Pattern" is helpful.
//             const oldMsg = statusMessage;
//             setStatusMessage('Wrong Pattern');
//             setTimeout(() => {
//                 setIsError(false);
//                 setStatusMessage(oldMsg);
//             }, 1000);
//         }
//     };

//     const handleLogout = () => {
//         Alert.alert(
//             "Reset App Lock",
//             "Logging out will reset your app lock settings. You will need to login again.",
//             [
//                 { text: "Cancel", style: "cancel" },
//                 {
//                     text: "Log Out", style: "destructive", onPress: () => {
//                         unlock(); // Unlock UI so they can see login
//                         setLockSettings('NONE'); // Reset lock
//                         logout(); // Perform logout
//                     }
//                 }
//             ]
//         );
//     };


//     if (!isLocked || lockType === 'NONE') return null;

//     return (
//         <View style={styles.container}>
//             <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1a1a' }]} />

//             <View style={styles.content}>

//                 {/* Header Section */}
//                 <View style={{ alignItems: 'center', marginTop: 40 }}>
//                     <View style={styles.topIconContainer}>
//                         {/* Small Lock Icon */}
//                         <Ionicons name="lock-closed" size={32} color="rgba(255,255,255,0.8)" />
//                     </View>

//                     <Text style={styles.title}>App Locked</Text>
//                     <Text style={styles.subtitle}>{statusMessage}</Text>
//                 </View>

//                 {/* Input Section - Centered */}
//                 <View style={styles.inputContainer}>
//                     {lockType === 'PIN' ? (
//                         <View style={{ width: '100%', alignItems: 'center' }}>
//                             <View style={styles.pinDots}>
//                                 {[...Array(4)].map((_, i) => (
//                                     <View
//                                         key={i}
//                                         style={[
//                                             styles.dot,
//                                             pin.length > i && styles.dotFilled,
//                                             isError && styles.dotError
//                                         ]}
//                                     />
//                                 ))}
//                             </View>
//                             <PinKeypad
//                                 onPress={handlePinPress}
//                                 onDelete={() => handlePinPress('backspace')}
//                                 biometricType={false}
//                                 textColor="#FFF"
//                                 borderColor="rgba(255,255,255,0.3)"
//                             />
//                         </View>
//                     ) : lockType === 'PATTERN' ? (
//                         <View style={{ alignItems: 'center' }}>
//                             <PatternLock
//                                 onPatternComplete={handlePatternComplete}
//                                 error={isError}
//                                 dotColor="rgba(255,255,255,0.5)"
//                                 activeDotColor="#FFF"
//                                 lineColor="#FFF"
//                             />
//                         </View>
//                     ) : (
//                         <Text style={{ color: '#fff' }}>Security: {lockType}</Text>
//                     )}
//                 </View>

//                 {/* Footer Section */}
//                 <View style={{ marginBottom: 32, alignItems: 'center' }}>
//                     {isBiometricsEnabled && (
//                         <TouchableOpacity onPress={handleBiometricAuth} style={{ padding: 10, marginBottom: 20 }}>
//                             <AnimatedFingerprint size={38} color="#4A90E2" />
//                         </TouchableOpacity>
//                     )}

//                     <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
//                         <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Forgot Passcode?</Text>
//                     </TouchableOpacity>
//                 </View>

//             </View>
//         </View >
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         ...StyleSheet.absoluteFillObject,
//         zIndex: 99999,
//         backgroundColor: '#1a1a1a',
//     },
//     content: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'space-between', // Distribute space
//         paddingHorizontal: 20,
//     },
//     topIconContainer: {
//         marginBottom: 10,
//         width: 48,
//         height: 48,
//         borderRadius: 24,
//         backgroundColor: 'rgba(255,255,255,0.1)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     faceIdContainer: {
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     biometricLabel: {
//         color: '#4A90E2',
//         marginTop: 8,
//         fontSize: 14,
//         fontWeight: '600',
//     },
//     title: {
//         fontSize: 20,
//         color: '#FFF',
//         fontWeight: 'bold',
//         marginBottom: 5,
//     },
//     subtitle: {
//         fontSize: 14,
//         color: 'rgba(255,255,255,0.7)',
//         marginBottom: 10,
//         minHeight: 20,
//         textAlign: 'center',
//     },
//     inputContainer: {
//         width: '100%',
//         alignItems: 'center',
//         justifyContent: 'center',
//         flex: 1, // Take available middle space
//     },
//     pinDots: {
//         flexDirection: 'row',
//         marginBottom: 40,
//     },
//     dot: {
//         width: 12,
//         height: 12,
//         borderRadius: 6,
//         borderWidth: 1,
//         borderColor: '#FFF',
//         marginHorizontal: 12,
//     },
//     dotFilled: {
//         backgroundColor: '#FFF',
//     },
//     dotError: {
//         borderColor: '#FF4444',
//         backgroundColor: '#FF4444'
//     }
// });
