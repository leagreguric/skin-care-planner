import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { client } from '../utils/KindeConfig';
import bgImage from './../assets/images/bcg.jpg'; 
import Colors from '../utils/Colors';
import { supabase } from '../utils/SupabaseConfig';
import services from '../utils/services';

// Set notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export default function Home() {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [skinType, setSkinType] = useState(''); 
    const [uvIndex, setUvIndex] = useState(null);

    useEffect(() => {
        checkUserAuth();
        getUserDetails(); 
        fetchUVIndex(); 
        scheduleSPFReminder(); // Schedule SPF reminder
    }, []);

    const checkUserAuth = async () => {
        const result = await services.getData('login');
        if (!result) {
            console.log("checkUserAuth: ", result);
            router.replace('/login');
        }
    };

    const handleLogout = async () => {
        const loggedOut = await client.logout();
        if (loggedOut) {
            await services.storeData('login', 'false');
            router.replace('/login');
        }
    };

    const getUserDetails = async () => {
        try {
            const user = await client.getUserDetails();
            if (user && user.given_name) {
                setUserName(user.given_name); 
            } else {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('name')
                    .single();

                if (userError) {
                    console.error('Error fetching user from Supabase:', userError.message);
                } else if (userData) {
                    setUserName(userData.name); 
                }
            }

            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('skin_type')
                .eq('user_id', user.id)
                .single();

            if (profileError) {
                console.error('Error fetching user profile from Supabase:', profileError.message);
            } else if (profileData) {
                setSkinType(profileData.skin_type); 
            }
        } catch (error) {
            console.error('Error in getUserDetails:', error.message);
        }
    };

    const fetchUVIndex = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=uv_index`);
            const data = await response.json();

            if (data && data.hourly && data.hourly.uv_index) {
                const currentHour = new Date().getHours();
                const currentUVIndex = data.hourly.uv_index[currentHour];
                setUvIndex(currentUVIndex);
            } else {
                console.error('UV index data not available');
                setUvIndex('N/A');
            }
        } catch (error) {
            console.error('Error fetching UV index:', error.message);
            setUvIndex('N/A');
        }
    };

    const scheduleSPFReminder = async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Please enable notifications to receive SPF reminders');
                return;
            }

            const interval = 3 * 60 * 60; 


            await Notifications.cancelAllScheduledNotificationsAsync();


            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "SPF!",
                    body: "Ne zaboravi nanijeti SPF!",
                    sound: true,
                },
                trigger: {
                    seconds: interval,
                    repeats: true,
                },
            });

            console.log("Notification scheduled.");
        } catch (error) {
            console.error('Error scheduling SPF reminder:', error.message);
        }
    };

    return (
        <ImageBackground source={bgImage} style={styles.bgImage}>
            <View style={styles.container}>
                <Text style={styles.title}>Bok, {userName || 'User'}!</Text>
                
                <Text style={styles.skinTypeText}>
                    {skinType ? `Tvoj tip kože je: ${skinType}` : 'Tip kože nije postavljen'}
                </Text>
                
                <Text style={styles.uvIndexText}>
                    {uvIndex !== null ? `Trenutni UV indeks: ${uvIndex}` : 'UV indeks nije dostupan'}
                </Text>

                <TouchableOpacity style={styles.button} onPress={() => router.push('/survey')}>
                    <Text style={styles.buttonText}>Odaberi tip</Text>
                </TouchableOpacity>
                
                
                <TouchableOpacity style={styles.button} onPress={() => router.push('/routineView')}>
                    <Text style={styles.buttonText}>Tvoja rutina</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.button} onPress={() => router.push('/diary')}>
                    <Text style={styles.buttonText}>Dnevnik napretka</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
                    <Text style={styles.buttonLogoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgImage: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center',     
        width: '100%',
        height: '100%',
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: Colors.DARK,
        marginBottom: 10,
    },
    skinTypeText: {
        fontSize: 20,
        fontWeight:'bold',
        color: Colors.DARK,
        marginBottom: 10,
    },
    uvIndexText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.DARK,
        marginBottom: 20,
    },
    button: {
        backgroundColor: Colors.PRIMARY,
        padding: 15,
        paddingHorizontal: 30,
        borderRadius: 99,
        marginTop: 20,
        width: 250,
    },
    buttonText: {
        textAlign: 'center',
        color: Colors.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonLogout: {
        backgroundColor: Colors.DARK, 
        padding: 15,
        paddingHorizontal: 30,
        borderRadius: 99,
        marginTop: 50,
        width: 250,
    },
    buttonLogoutText: {
        textAlign: 'center',
        color: Colors.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },

});
