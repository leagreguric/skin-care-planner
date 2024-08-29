import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { supabase } from '../../utils/SupabaseConfig'; // Adjust path
import { client } from '../../utils/KindeConfig'; // Adjust path
import { useRouter } from 'expo-router';
import Colors from '../../utils/Colors';
import bgImage from '../../assets/images/bcg.jpg';

export default function RoutineView() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [routines, setRoutines] = useState({});
    const [today, setToday] = useState('');

    useEffect(() => {
        getUserDetails();
        getToday();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchUserRoutine(userId);
            }
        }, [userId])
    );

    // Get today's day of the week (e.g., 'Monday')
    const getToday = () => {
        const daysOfWeek = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];
        const today = new Date().getDay();
        setToday(daysOfWeek[today]);
    };

    const getUserDetails = async () => {
        try {
            const user = await client.getUserDetails();
            if (user && user.id) {
                setUserId(user.id);
                fetchUserRoutine(user.id);
                return;
            }

            const { data: userData, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user from Supabase:', error.message);
                Alert.alert('Error', 'Failed to get user details from Supabase');
            } else if (userData) {
                setUserId(userData.id);
                fetchUserRoutine(userData.id);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            Alert.alert('Error', 'An error occurred while fetching user details');
        }
    };

    const fetchUserRoutine = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_routines')
                .select('*')
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching user routine:', error.message);
                Alert.alert('Error', 'Failed to fetch user routine');
            } else {
                const routinesByDay = {
                    Ponedjeljak: [],
                    Utorak: [],
                    Srijeda: [],
                    Četvrtak: [],
                    Petak: [],
                    Subota: [],
                    Nedjelja: [],
                };
                
                data.forEach((item) => {
                    routinesByDay[item.day].push(item);
                });

                setRoutines(routinesByDay);
            }
        } catch (error) {
            console.error('Error fetching user routine:', error);
            Alert.alert('Error', 'An error occurred while fetching user routine');
        }
    };

    const renderRoutine = ({ item }) => (
        <View style={[styles.section, item.day === today && styles.todaySection]}>
            <Text style={[styles.sectionTitle, item.day === today && styles.todayTitle]}>
                {item.day}
            </Text>
            {item.routines.length > 0 ? (
                item.routines.map((routine) => (
                    <Text style={styles.listItem} key={routine.id}>
                        {routine.product_name} - {routine.routine_time}
                    </Text>
                ))
            ) : (
                <Text style={styles.emptyText}>Nema spremljene rutine za {item.day}</Text>
            )}
        </View>
    );

    const daysOfWeek = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];

    const data = daysOfWeek.map(day => ({
        day,
        routines: routines[day] || [],
    }));

    return (
        <ImageBackground source={bgImage} style={styles.bgImage}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                
                <Text style={styles.title}>Tvoja tjedna rutina</Text>

                <TouchableOpacity style={styles.addRoutineButton} onPress={() => router.push('/routine')}>
                    <Text style={styles.buttonText}>Dodaj rutinu</Text>
                </TouchableOpacity>

                <FlatList
                    data={data}
                    renderItem={renderRoutine}
                    keyExtractor={(item) => item.day}
                    contentContainerStyle={styles.scrollContainer}
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    scrollContainer: {
        paddingBottom: 20,  
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        marginTop:50,
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.DARK,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
    },
    backButtonText: {
        fontSize: 30 ,
        color: '#D81B60',
    },
    addRoutineButton: {
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignSelf: 'center',
        marginBottom: 30,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: Colors.PRIMARY,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    todaySection: {
        backgroundColor: Colors.DARK, 
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.DARK,
        marginBottom: 10,
        textAlign: 'center',
    },
    todayTitle: {
        color: Colors.LIGHT, 
    },
    listItem: {
        fontSize: 18,
        color: Colors.WHITE,
        textAlign: 'center',
        paddingVertical: 5,
    },
    emptyText: {
        fontSize: 18,
        color: Colors.WHITE,
        textAlign: 'center',
    },
});
