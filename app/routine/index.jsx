import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, ImageBackground } from 'react-native';
import { supabase } from '../../utils/SupabaseConfig'; 
import { client } from '../../utils/KindeConfig'; 
import { useRouter } from 'expo-router';
import Colors from '../../utils/Colors';
import bgImage from '../../assets/images/bcg.jpg';


export default function RoutineTracking() {
    const router = useRouter();
    const [product, setProduct] = useState('');
    const [routineTime, setRoutineTime] = useState('jutro');
    const [selectedDay, setSelectedDay] = useState('Ponedjeljak');
    const [products, setProducts] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        getUserDetails();
    }, []);

    const getUserDetails = async () => {
        try {
            const user = await client.getUserDetails();
            if (user && user.id) {
                setUserId(user.id);
                return;
            }

            const { data: userData, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user from Supabase:', error.message);
                Alert.alert('Error', 'Failed to get user details from Supabase');
            } else if (userData) {
                setUserId(userData.id);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            Alert.alert('Error', 'An error occurred while fetching user details');
        }
    };

    const handleAddProduct = () => {
        if (product.trim() === '') {
            Alert.alert('Error', 'Product name cannot be empty.');
            return;
        }
        setProducts([...products, { name: product, routineTime, day: selectedDay }]);
        setProduct('');
    };

    const handleSaveRoutine = async () => {
        if (!userId) {
            Alert.alert('Error', 'No user is logged in.');
            return;
        }

        try {
            for (let item of products) {
                const { error } = await supabase
                    .from('user_routines')
                    .insert([
                        {
                            user_id: userId,
                            product_name: item.name,
                            routine_time: item.routineTime,
                            day: item.day, 
                        },
                    ]);

                if (error) {
                    console.error('Error saving routine:', error.message);
                    Alert.alert('Error', 'Failed to save routine');
                    return;
                }
            }

            Alert.alert('Success', 'Routine saved successfully!');
            router.replace('/routineView');
        } catch (error) {
            console.error('Error saving routine:', error);
            Alert.alert('Error', 'An error occurred while saving routine');
        }
    };

    return (
        <ImageBackground source={bgImage} style={styles.bgImage}>
            <View style={styles.container}>
                <Text style={styles.title}>Dodaj svoju rutinu</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Unesite proizvod"
                    placeholderTextColor={Colors.LIGHT}
                    value={product}
                    onChangeText={setProduct}
                />

                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            routineTime === 'jutro' && styles.activeButton,
                        ]}
                        onPress={() => setRoutineTime('jutro')}
                    >
                        <Text style={styles.buttonText}>Jutro</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            routineTime === 'večer' && styles.activeButton,
                        ]}
                        onPress={() => setRoutineTime('večer')}
                    >
                        <Text style={styles.buttonText}>Večer</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dayGroup}>
                    {['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'].map((day) => (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayButton,
                                selectedDay === day && styles.activeDayButton,
                            ]}
                            onPress={() => setSelectedDay(day)}
                        >
                            <Text style={styles.buttonText}>{day}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                    <Text style={styles.buttonText}>Dodaj</Text>
                </TouchableOpacity>

                <FlatList
                    data={products}
                    renderItem={({ item }) => (
                        <Text style={styles.listItem}>
                            {item.name} - {item.routineTime} ({item.day})
                        </Text>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nema dodanih proizvoda</Text>}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveRoutine}>
                    <Text style={styles.buttonText}>Spremi rutinu</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    container: {
        marginTop: 200,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.DARK,
    },
    input: {
        width: '80%',
        padding: 15,
        borderWidth: 1,
        borderColor: Colors.LIGHT,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 30,
        marginBottom: 20,
        color: Colors.DARK,
        fontSize: 18,
        textAlign: 'center',
    },
    buttonGroup: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        margin: 5,
        backgroundColor: '#A33653',
        borderRadius: 30,
    },
    activeButton: {
        backgroundColor: Colors.DARK,
    },
    dayGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    dayButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        margin: 5,
        backgroundColor: '#A33653',
        borderRadius: 30,
    },
    activeDayButton: {
        backgroundColor: Colors.DARK,
    },
    buttonText: {
        color: Colors.WHITE,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    addButton: {
        marginTop: 20,
        paddingVertical: 15,
        paddingHorizontal: 50,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 30,
        alignSelf: 'center',
    },
    saveButton: {
        marginTop: 30,
        marginBottom: 25,
        paddingVertical: 15,
        paddingHorizontal: 50,
        backgroundColor: Colors.DARK,
        borderRadius: 30,
        alignSelf: 'center',
    },
    listItem: {
        fontSize: 18,
        color: Colors.WHITE,
        backgroundColor: Colors.DARK,
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
        textAlign: 'center',
        width: '80%',
    },
    emptyText: {
        fontSize: 18,
        color: Colors.DARK,
        textAlign: 'center',
        marginTop: 20,
    },
});
