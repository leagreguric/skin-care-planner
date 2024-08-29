import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import React, { useState } from 'react';
import supabase from '../../utils/SupabaseConfig';
import { client } from '../../utils/KindeConfig'; 

export default function RoutineTracking() {
    const [product, setProduct] = useState('');
    const [routineTime, setRoutineTime] = useState('morning');
    const [products, setProducts] = useState([]);

    const handleAddProduct = () => {
        setProducts([...products, { name: product, routineTime }]);
        setProduct('');
    };

    const handleSaveRoutine = async () => {
        try {
            const userInfo = await client.getUserDetails(); // Pretpostavljam da koristiš Kinde
            const { id } = userInfo;
    
            for (let item of products) {
                const { error } = await supabase.from('user_routines').insert([
                    {
                        user_id: id,
                        product_name: item.name,
                        routine_time: item.routineTime,
                        usage_instructions: '', // Možeš dodati dodatna uputstva ovde
                    },
                ]);

                // Ako postoji greška u Supabase upitu
                if (error) {
                    throw new Error(`Failed to save routine for product ${item.name}: ${error.message}`);
                }
            }

            alert('Routine saved successfully!'); // Prikaži poruku o uspehu
        } catch (error) {
            console.error('Error saving routine:', error);
            alert('Failed to save routine. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Track Your Routine</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter product name"
                value={product}
                onChangeText={setProduct}
            />
            <View style={styles.buttonGroup}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        routineTime === 'morning' && styles.activeButton,
                    ]}
                    onPress={() => setRoutineTime('morning')}
                >
                    <Text style={styles.buttonText}>Morning</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.button,
                        routineTime === 'evening' && styles.activeButton,
                    ]}
                    onPress={() => setRoutineTime('evening')}
                >
                    <Text style={styles.buttonText}>Evening</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                <Text style={styles.buttonText}>Add Product</Text>
            </TouchableOpacity>
            <FlatList
                data={products}
                renderItem={({ item }) => (
                    <Text style={styles.listItem}>
                        {item.name} - {item.routineTime}
                    </Text>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveRoutine}>
                <Text style={styles.buttonText}>Save Routine</Text>
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
    input: {
        width: '80%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonGroup: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    button: {
        padding: 10,
        margin: 5,
        backgroundColor: '#ccc',
        borderRadius: 5,
    },
    activeButton: {
        backgroundColor: '#007bff',
    },
    addButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#28a745',
        borderRadius: 5,
    },
    listItem: {
        fontSize: 18,
        marginTop: 5,
    },
    saveButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
    },
});
