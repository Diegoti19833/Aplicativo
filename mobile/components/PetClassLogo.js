import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

// SVG paths para os ícones (extraídos do Lucide)
function GraduationCapIcon({ size = 16, color = '#0B1120' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="m22 10-10-5L2 10l10 5 10-5z" />
            <Path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
            <Path d="M22 10v6" />
        </Svg>
    );
}

function PawPrintIcon({ size = 22, color = '#FFFFFF' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M11 14c0-1.7 1.3-3 3-3 .6 0 1 .4 1 1v2c0 .6-.4 1-1 1h-2c-.6 0-1-.4-1-1Z" />
            <Path d="M16.5 10c.3-1.7-.7-3.5-2-4-.4-.2-.9 0-1.2.3l-.6.9c-.3.5-.2 1.1.2 1.5l1.2 1c.5.4 1.2.4 1.7 0 .2-.1.5-.4.7-.7Z" />
            <Path d="M7.5 10c-.3-1.7.7-3.5 2-4 .4-.2.9 0 1.2.3l.6.9c.3.5.2 1.1-.2 1.5l-1.2 1c-.5.4-1.2.4-1.7 0-.2-.1-.5-.4-.7-.7Z" />
            <Path d="M19.4 15c.7-1.5.2-3.4-1-4.2-.4-.3-.9-.2-1.2.1l-.8.8c-.3.4-.4 1-.1 1.5l.8 1.2c.3.5 1 .7 1.5.5.3-.1.5-.3.8-.5l0-.4Z" />
            <Path d="M4.6 15c-.7-1.5-.2-3.4 1-4.2.4-.3.9-.2 1.2.1l.8.8c.3.4.4 1 .1 1.5l-.8 1.2c-.3.5-1 .7-1.5.5-.3-.1-.5-.3-.8-.5l0-.4Z" />
            <Path d="M12 18a3 3 0 0 0-3 3c0 .6.4 1 1 1h4c.6 0 1-.4 1-1a3 3 0 0 0-3-3Z" />
        </Svg>
    );
}

export default function PetClassLogo({ scale = 1, type = 'light' }) {
    const textColor = type === 'dark' ? '#1F2937' : '#FFFFFF';

    return (
        <View style={[styles.container, { transform: [{ scale }] }]}>
            {/* Grupo de Ícones */}
            <View style={styles.iconGroup}>
                {/* Quadrado branco com capelo ao fundo */}
                <View style={styles.capBox}>
                    <GraduationCapIcon size={16} color="#0B1120" />
                </View>

                {/* Círculo verde em degradê com patinha na frente */}
                <LinearGradient
                    colors={['#34D399', '#129151', '#064E29']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.pawBox}
                >
                    <View style={{ transform: [{ rotate: '-12deg' }] }}>
                        <PawPrintIcon size={22} color="#FFFFFF" />
                    </View>
                </LinearGradient>
            </View>

            {/* Texto Empilhado */}
            <View style={styles.textGroup}>
                <Text style={[styles.textPet, { color: textColor }]}>
                    PET
                </Text>
                <Text style={[styles.textClass, { color: textColor }]}>
                    CLASS
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    iconGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    capBox: {
        width: 32,
        height: 32,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: -12,
        zIndex: 0,
        borderWidth: 1,
        borderColor: 'rgba(243, 244, 246, 0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    pawBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    textGroup: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 2,
    },
    textPet: {
        fontWeight: '900',
        fontSize: 24,
        letterSpacing: 1,
        lineHeight: 24,
        textTransform: 'uppercase',
    },
    textClass: {
        fontWeight: '500',
        fontSize: 10,
        letterSpacing: 3,
        lineHeight: 12,
        textTransform: 'uppercase',
        opacity: 0.9,
        marginTop: -2,
    },
});
