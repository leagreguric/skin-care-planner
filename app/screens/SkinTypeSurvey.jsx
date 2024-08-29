import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import services from '../../utils/services';
import supabase from '../../utils/SupabaseConfig'

export default function SkinTypeSurvey() {
    const [skinType, setSkinType] = useState(null);
    const router = useRouter();

    const handleSubmit = async () => {
        if (skinType) {
            // Dobavljanje korisničkog ID-a iz lokalne pohrane ili Kinde
            const userInfo = await client.getUserInfo();
            const { id } = userInfo;

            // Ažuriraj tip kože u Supabase
            await supabase
                .from('user_profiles')
                .update({ skin_type: skinType })
                .eq('user_id', id);

            // Preusmjeri korisnika na Home ekran
            router.replace('/home');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Your Skin Type</Text>
            <TouchableOpacity onPress={() => setSkinType('normal')}>
                <Text style={styles.option}>Normal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSkinType('oily')}>
                <Text style={styles.option}>Oily</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSkinType('combination')}>
                <Text style={styles.option}>Combination</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    option: {
        fontSize: 20,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#ccc',
        borderRadius: 5,
    },
    button: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});
