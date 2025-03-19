import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity } from "react-native"
import React, { useState } from "react"
import { auth } from "../FirebaseConfig"
import { sendPasswordResetEmail } from "firebase/auth"
import { router } from "expo-router"

export default function ForgotPassword() {

    const [email, setEmail] = useState('');

    const isInputValid = email.trim() !== ''

    const forgotPassword = async() => {
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent! Check your inbox.");
            router.push('/')
        } catch (error: any) {
            console.log(error)
            alert("Failed to send reset email: " + error.message);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.forgotPassword}>We'll email you a link to reset your password</Text>
                <View style={styles.content}>
                    <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    />
                    <TouchableOpacity style={[styles.button, !isInputValid && styles.disabledButton]} onPress={forgotPassword}>
                    <Text style={styles.buttonText}>Reset Password</Text>
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
    forgotPassword: {
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    disabledButton: {
        backgroundColor: "#A9A9A9",
    },
  });
