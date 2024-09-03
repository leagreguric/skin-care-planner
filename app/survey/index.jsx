import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import { supabase } from '../../utils/SupabaseConfig'; 
import { client } from '../../utils/KindeConfig'; 
import { useRouter, Stack } from 'expo-router'; 
import bgImage from '../../assets/images/bcg.jpg'; 
import Colors from '../../utils/Colors';

export default function SkinTypeSurvey() {
    const [skinType, setSkinType] = useState(null);
    const router = useRouter();

    const handleSubmit = async () => {
        if (skinType) {
            try {
                const userInfo = await client.getUserDetails();
                const { id } = userInfo;
    
                if (!supabase) {
                    throw new Error('Supabase client is not initialized');
                }
    
                const { data: existingProfile, error: selectError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', id)
                    .single();
    
                if (selectError && selectError.code !== 'PGRST116') {
                    throw new Error(`Error fetching profile: ${selectError.message}`);
                }
    
                if (existingProfile) {
                    const { error: updateError } = await supabase
                        .from('user_profiles')
                        .update({ skin_type: skinType })
                        .eq('user_id', id);
    
                    if (updateError) {
                        throw new Error(`Error updating skin type: ${updateError.message}`);
                    } else {
                        Alert.alert('Success', 'Skin type updated successfully!');

                        router.replace('/');
                    }
                } else {
                    const { error: insertError } = await supabase
                        .from('user_profiles')
                        .insert({ user_id: id, skin_type: skinType });
    
                    if (insertError) {
                        throw new Error(`Error inserting skin type: ${insertError.message}`);
                    } else {
                        Alert.alert('Success', 'Skin type saved successfully!');

                        router.replace('/');
                    }
                }
            } catch (error) {
                console.error('Error during submission:', error);  
                Alert.alert('Error', `An error occurred during submission: ${error.message}`);
            }
        } else {
            Alert.alert('Error', 'Please select a skin type');
        }
    };
    
    

    return (
        <ImageBackground source={bgImage} style={styles.background}>
            
            <View style={styles.container}>
                
                <Text style={styles.title}>Koji je tvoj tip kože?</Text>
                <TouchableOpacity style={[styles.optionButton, skinType === 'masna' && styles.selected]} onPress={() => setSkinType('masna')}>
                    <Text style={styles.optionText}>masna</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionButton, skinType === 'suha' && styles.selected]} onPress={() => setSkinType('suha')}>
                    <Text style={styles.optionText}>suha</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionButton, skinType === 'kombinirana' && styles.selected]} onPress={() => setSkinType('kombinirana')}>
                    <Text style={styles.optionText}>kombinirana</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>SPREMI</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.DARK,
        marginBottom: 30,
    },
    optionButton: {
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginBottom: 15,
    },
    selected: {
        backgroundColor: Colors.DARK,
    },
    optionText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: Colors.DARK,
        paddingVertical: 15,
        paddingHorizontal: 80,
        borderRadius: 30,
        marginTop: 50,
    },
    submitButtonText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },

});
