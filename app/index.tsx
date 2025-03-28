import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity } from "react-native"
import React, { useState } from "react"
import { auth } from "../FirebaseConfig"
import { signInWithEmailAndPassword } from "firebase/auth"
import { router } from "expo-router"
import { Image } from 'expo-image';

const index = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isInputValid = email.trim() !== '' && password.trim() !== '';

    const logIn = async() => {
        try {
            const user = await signInWithEmailAndPassword(auth, email, password)
            if(user) router.replace('/(tabs)/home');
        } catch (error: any) {
            console.log(error)
            alert("Sign in failed: " + error.message);
        }
    }

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>SPROUT</Text>
        <View style={styles.container}>
          <Image
            style={styles.image}
            source={require('../assets/images/logo.png')}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={() => router.push('/forgotpassword')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, !isInputValid && styles.disabledButton]} onPress={logIn}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/register')}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 64,
      fontWeight: 'bold',
      marginBottom: 0,
    },
    image: {
      width: 300,
      height: 300,
    },
    input: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 10,
      marginBottom: 15,
      paddingHorizontal: 10,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: 20,
      color: '#808080',
    },
    button: {
      width: '100%',
      height: 50,
      backgroundColor: '#007BFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      marginBottom: 15,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    disabledButton: {
      backgroundColor: "#A9A9A9",
    },
  });

export default index
