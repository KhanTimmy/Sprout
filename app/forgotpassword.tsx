import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity } from "react-native"
import React, { useState } from "react"
import { auth } from "../FirebaseConfig"
import { sendPasswordResetEmail } from "firebase/auth"
import { router } from "expo-router"
import CustomButton from "@/components/CustomButton";

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
                <CustomButton
                    title="Reset Password"
                    onPress={forgotPassword}
                    variant={isInputValid ? "primary" : "secondary"} // Reflect validity via the variant
                    style={isInputValid ? {} : styles.disabledButton} // Apply optional disabled styling
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
    forgotPassword: {
        alignSelf: 'flex-start',
        fontSize: 32,
        marginBottom: 20,
    },
    disabledButton: {
        backgroundColor: "#A9A9A9",
    },
});

