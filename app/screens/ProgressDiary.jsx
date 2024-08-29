import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function ProgressDiaryScreen() {
    const [entry, setEntry] = useState('');

    const handleSaveEntry = () => {
        if (entry.trim()) {
            // Ovdje možete spremiti entry u bazu podataka ili AsyncStorage
            Alert.alert('Entry Saved', 'Your progress entry has been saved.');
            setEntry(''); // Resetiranje inputa nakon spremanja
        } else {
            Alert.alert('Error', 'Please enter some text.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Progress Diary</Text>
            <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={6}
                placeholder="Enter your progress here..."
                value={entry}
                onChangeText={setEntry}
            />
            <Button title="Save Entry" onPress={handleSaveEntry} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F5FCFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#fff',
        textAlignVertical: 'top', // Za Android da tekst počinje s vrha
    },
});
