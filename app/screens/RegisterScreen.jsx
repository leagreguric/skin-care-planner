import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/SupabaseConfig';
import services from '../../utils/services';

export default function RegisterScreen() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const router = useRouter();

    const handleRegister = async () => {
        try {
            // Supabase registracija
            const { user, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Provjera postojanja korisnika u bazi
            const { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('email', user.email)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            // Ako korisnik ne postoji, unesite ga u bazu
            if (!existingUser) {
                const { data, error: insertError } = await supabase
                    .from('users')
                    .insert([{ email: user.email, skin_type: '' }]);

                if (insertError) throw insertError;
            }

            // Pohrani podatke o prijavi
            await services.storeData('login', 'true');
            
            // Preusmjeri na anketu
            router.replace('/survey');  // Možeš preusmjeriti na stranicu za unos tipa kože
        } catch (error) {
            console.error("Registration error: ", error.message);
            Alert.alert("Registration Error", "Došlo je do greške prilikom registracije. Pokušajte ponovno.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title="Register" onPress={handleRegister} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 },
});
