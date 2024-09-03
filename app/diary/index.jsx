import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    ImageBackground,
    Image,
} from 'react-native';
import { supabase } from '../../utils/SupabaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../utils/Colors';
import bgImage from '../../assets/images/bcg.jpg';
import { client } from '../../utils/KindeConfig';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ProgressDiaryScreen() {
    const navigation = useNavigation();
    const [entry, setEntry] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [existingEntryId, setExistingEntryId] = useState(null);
    const [entries, setEntries] = useState([]);
    const [imageUri, setImageUri] = useState(null);

    useEffect(() => {
        getUserId();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchAllEntries();
        }
    }, [userId]);

    const getUserId = async () => {
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

    const fetchAllEntries = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('progress_diary')
                .select('*')
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching entries:', error.message);
                Alert.alert('Error', 'Failed to fetch entries.');
            } else {
                const sortedEntries = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setEntries(sortedEntries);
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEntry = async () => {
        if (!entry.trim()) {
            Alert.alert('Error', 'Please enter some text.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                user_id: userId,
                description: entry,
                date: selectedDate.toISOString().split('T')[0],
                image_url: imageUri, 
            };

            let response;
            if (existingEntryId) {
                response = await supabase
                    .from('progress_diary')
                    .update(payload)
                    .eq('id', existingEntryId);
            } else {
                response = await supabase.from('progress_diary').insert(payload);
            }

            const { error } = response;

            if (error) {
                console.error('Error saving entry:', error.message);
                Alert.alert('Error', 'Failed to save entry.');
            } else {
                Alert.alert('Success', 'Your progress entry has been saved.');
                fetchAllEntries();
                setEntry('');
                setExistingEntryId(null);
                setImageUri(null); 
            }
        } catch (error) {
            console.error('Error saving entry:', error);
            Alert.alert('Error', 'An unexpected error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    const onChangeDate = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const renderEntry = ({ item }) => (
        <TouchableOpacity
            style={styles.entryItem}
            onPress={() => {
                setEntry(item.description);
                setSelectedDate(new Date(item.date));
                setExistingEntryId(item.id);
                setImageUri(item.image_uri);
            }}
        >
            <Text style={styles.entryDate}>{new Date(item.date).toDateString()}</Text>
            <Text style={styles.entryText}>{item.description}</Text>
            {item.image_url && <Image source={{ uri: item.image_url }} style={styles.entryImage} />}
        </TouchableOpacity>
    );

    return (
        <ImageBackground source={bgImage} style={styles.bgImage}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Dnevnik napretka</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={Colors.PRIMARY} />
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.datePickerText}>
                                {selectedDate.toDateString()}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={onChangeDate}
                                maximumDate={new Date()}
                            />
                        )}

                        <TextInput
                            style={styles.textInput}
                            multiline
                            numberOfLines={5}
                            placeholder="Unesi svoj napredak..."
                            placeholderTextColor={Colors.LIGHT}
                            value={entry}
                            onChangeText={setEntry}
                        />

                        <View style={styles.imagePickerContainer}>
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={pickImage}
                            >
                                <Text style={styles.cameraButtonText}>Uslikaj lice</Text>
                            </TouchableOpacity>

                            {imageUri && (
                                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSaveEntry}
                        >
                            <Text style={styles.saveButtonText}>
                                {existingEntryId ? 'Ažuriraj' : 'Spremi'}
                            </Text>
                        </TouchableOpacity>

                        <FlatList
                            data={entries}
                            renderItem={renderEntry}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContainer}
                        />
                    </>
                )}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 10,
    },
    backButtonText: {
        fontSize: 30,
        color: Colors.DARK,
    },
    title: {
        marginTop: 50,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: Colors.DARK,
        marginBottom: 20,
    },
    datePickerButton: {
        alignSelf: 'center',
        padding: 10,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 20,
        marginBottom: 20,
    },
    datePickerText: {
        fontSize: 18,
        color: Colors.WHITE,
    },
    textInput: {
        backgroundColor: Colors.PRIMARY,
        color: Colors.WHITE,
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        textAlignVertical: 'top',
        marginBottom: 20,
        height: 150,
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    cameraButton: {
        backgroundColor: Colors.DARK,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 10,
    },
    cameraButtonText: {
        color: Colors.WHITE,
        fontSize: 18,
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginTop: 10,
    },
    saveButton: {
        backgroundColor: Colors.DARK,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 30,
    },
    saveButtonText: {
        color: Colors.WHITE,
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingBottom: 20,
    },
    entryItem: {
        backgroundColor: Colors.PRIMARY,
        borderRadius: 20,
        padding: 20,
        marginBottom: 10,
    },
    entryDate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.DARK,
        marginBottom: 5,
    },
    entryText: {
        fontSize: 16,
        color: Colors.WHITE,
    },
    entryImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginTop: 10,
    },
});
