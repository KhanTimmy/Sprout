import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView,
  Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator
 } from "react-native"
import React, { useState } from "react"
import { auth } from "../FirebaseConfig"
import { signInWithEmailAndPassword } from "firebase/auth"
import { router } from "expo-router"
import { Image } from 'expo-image';
import CustomButton from "@/components/CustomButton";
import { Ionicons } from '@expo/vector-icons';
import { setIndexConfiguration } from "firebase/firestore"


const index = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureText, setSecureText] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isInputValid = email.trim() !== '' && password.trim() !== '';

   const logIn = async () => {
      setError('');
      if (!email.includes('@')) {
        setError('Invalid email format.');
        return;
      }

      try {
        setLoading(true);
        const user = await signInWithEmailAndPassword(auth, email, password);
        if (user) router.replace('/(tabs)/home');
      } catch (error: any){
        console.log(error);
        setError("Sign in failed: " + error.message);
      } finally {
        setLoading(false);
      }
   };

    return (
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, width: '100%'}}
            >
              <ScrollView //allows for a bit of scrolling and moved around stuff for it to work appropiately across the screen
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
              >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.title}>SPROUT</Text>
            <Image
              style={styles.image}
              source={require('../assets/images/logo.png')}
              contentFit = "contain"
            />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
            autoCapitalize="none"
            textContentType="password"
            />
    
       
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Ionicons
            name={secureText ? "eye-off" : "eye"}
            size={24}
            color="gray"
            />
        </TouchableOpacity>
        </View>
      

          <TouchableOpacity onPress={() => router.push('/forgotpassword')}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size = "large" color="#2196F3" style={{ marginVertical: 10 }} />
        ) : (
          <CustomButton
          title="Login"
          onPress={logIn}
          variant={isInputValid ? "primary" : "secondary"}
          style={[!isInputValid && styles.disabledButton]}
        />
        )}

          <CustomButton
            title="Register"
            onPress={() => router.push('/register')}
            variant="primary"
        />
        </View>
        </TouchableWithoutFeedback>
        </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {  //added
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 0,
  },
  image: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    borderRadius: 100,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    height: '100%', //Fills container height
    paddingRight: 10,
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    color: '#808080',
  },
  disabledButton: {
    backgroundColor: "#A9A9A9",
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },
});

export default index
