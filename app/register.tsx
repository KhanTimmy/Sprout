import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity } from "react-native"
import React, { useState } from "react"
import { auth } from "../FirebaseConfig"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { router } from "expo-router"

export default function Register() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isInputValid = email.trim() !== '' && password.trim() !== '';

    const register = async() => {
        try {
            await createUserWithEmailAndPassword(auth, email, password)
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
                    <TouchableOpacity style={[styles.button, !isInputValid && styles.disabledButton]} onPress={register}>
                    <Text style={styles.buttonText}>Register</Text>
                    </TouchableOpacity>
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
    button: {
      width: "100%",
      height: 50,
      backgroundColor: "#007BFF",
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    register: {
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    disabledButton: {
        backgroundColor: "#A9A9A9",
    },
  });
