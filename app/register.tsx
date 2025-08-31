import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity } from "react-native"
import React, { useState } from "react"
import { auth } from "../firebase.config"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { router } from "expo-router"
import CustomButton from '@/components/CustomButton';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isInputValid = email.trim() !== '' && password.trim() !== '';

    const register = async() => {
        try {
            await createUserWithEmailAndPassword(auth, email.toLowerCase(), password)
            router.push('/')
        } catch (error: any) {
            console.log(error)
            alert("Registration failed: " + error.message);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.register}>Register</Text>
            <View style={styles.content}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <CustomButton
                    title="Register"
                    onPress={register}
                    variant={isInputValid ? "primary" : "secondary"} // Adjust variant dynamically based on validity
                    style={isInputValid ? {} : styles.disabledButton} // Additional styling for disabled state
                />
                <CustomButton
                    title="Cancel"
                    onPress={() => router.back()}
                    variant="danger"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 20,
    },
    content: {
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    register: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    disabledButton: {
        backgroundColor: "#A9A9A9",
    },
});
