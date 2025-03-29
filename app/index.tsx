import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity } from "react-native"
import React, { useState } from "react"
import { auth } from "../FirebaseConfig"
import { signInWithEmailAndPassword } from "firebase/auth"
import { router } from "expo-router"
import { Image } from 'expo-image';
import CustomButton from "@/components/CustomButton";

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


        <CustomButton
          title="Login"
          onPress={logIn}
          variant={isInputValid ? "primary" : "secondary"} // Example to reflect the disabled state
          style={isInputValid ? {} : styles.disabledButton}
        />

        <CustomButton
          title="Register"
          onPress={() => router.push('/register')}
          variant="primary"
      />

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
      backgroundColor: '#fff',
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
    disabledButton: {
      backgroundColor: "#A9A9A9",
    },
  });

export default index
