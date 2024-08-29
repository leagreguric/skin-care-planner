import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import React from 'react';
import loginBg from './../../assets/images/bcg.jpg';
import logo from './../../assets/images/LOGO.png';
import Colors from '../../utils/Colors';
import services from '../../utils/services';
import { useRouter } from 'expo-router';
import { client } from '../../utils/KindeConfig';  // Kinde auth
import { supabase } from '../../utils/SupabaseConfig';  // Supabase client

export default function LoginScreen() {
    const router = useRouter();
    const handleSignIn = async () => {
        const token = await client.login();
        if (token) {
          await services.storeData('login','true')
          const user = await client.getUserDetails();
          checkUser(user);
          router.replace('/')
          
        }
      };

      const checkUser = async (user) => {
        const { id,email, given_name } = user;  // Ne koristi 'id' direktno
    
        try {
            // Step 1: Check if the user exists in the database
            const { data: existingUser, error: selectError } = await supabase
                .from('users')
                .select('id')
                .eq('id', id)
                .single();
    
            if (selectError && selectError.code !== 'PGRST116') {
                // Handle unexpected errors during selection
                console.error('Error checking user existence:', selectError.message);
                return;
            }
    
            // Step 2: If user does not exist, insert the user into the database
            if (!existingUser) {
                console.log("Inserting user...");
                const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert([
                        {   id,
                            email,           
                            name: given_name, 
                        },
                    ]);
    
                if (insertError) {
                    console.error('Error inserting user:', insertError.message);
                } else {
                    console.log('User inserted successfully:', newUser);
                }
                router.replace('/survey');
            } else {
                console.log('User already exists:', existingUser);
            }
        } catch (error) {
            console.error('Unexpected error:', error.message);
        }
    };
    

    return (
        <ImageBackground source={loginBg} style={styles.bgImage}>
            <View style={styles.container}>
                <Image source={logo} style={styles.logo} />
                <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                    <Text style={styles.buttonText}>Login/Signup</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                    * By login/signup you agree to our terms and conditions
                </Text>
                <Text style={styles.titleText}>
                    SKIN PROTECT
                </Text>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgImage: { width: '100%', height: '100%', flex: 1 },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    logo: { width: 250, height: 280, marginBottom: 20, marginTop: -100 },
    titleText: { fontSize: 35, fontWeight: 'bold', textAlign: 'center', color: Colors.PRIMARY, marginTop: 30 },
    button: { backgroundColor: Colors.PRIMARY, padding: 15, paddingHorizontal: 30, borderRadius: 99, marginTop: 30, width: 180 },
    buttonText: { textAlign: 'center', color: Colors.WHITE, fontSize: 20, fontWeight: 'bold' },
    termsText: { fontSize: 13, color: Colors.WHITE, marginTop: 10, textAlign: 'center' },
});
