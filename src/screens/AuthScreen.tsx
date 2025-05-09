import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useAuth } from "../context/AuthContext";

interface AuthProps{
  navigation:any;
}

export default function AuthScreen({navigation}:AuthProps){
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    Keyboard.dismiss();

    // input validation
    if(!email.trim()){
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if(!password.trim()){
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if(!isLogin){
      if(!fullName.trim()){
        Alert.alert('Error', 'Please enter your full name');
        return;
      }
      if(password !== confirmPassword){
        Alert.alert('Error', 'Passwords do not match')
        return;
      }
      // Password strength validation for sign up
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        Alert.alert('Error', 'Password must contain at least one uppercase letter');
        return;
      }
      if (!/[0-9]/.test(password)) {
        Alert.alert('Error', 'Password must contain at least one number');
        return;
      }
    }

    setLoading(true);

    try{
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }

      // Navigate to home screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Tabs' }],
      });

    }
    catch(error: any){
      let errorMessage = 'Authentication failed. Please try again';
      
      // Handle specific Firebase error messages
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect email or password. Please check your credentials and try again';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters and contain a mix of letters and numbers';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection';
      }
      
      Alert.alert('Authentication Error', errorMessage);
    }
    finally{
      setLoading(false);
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // clear fields when switching modes
    setPassword('')
    setConfirmPassword('');
  };

  const handleSocialAuth = (platform: string) => {
    Alert.alert('Social Login', `${platform} TODO`)
  };

  return (
    <TouchableWithoutFeedback
    onPress={Keyboard.dismiss}>
      <View
      style={styles.container}
      >
        <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradient}
        >
          <Text
          style={styles.welcomeText}
          >
            Welcome!
          </Text>
        </LinearGradient>
        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
        >
          <View style={styles.tabContainer}>
            <TouchableOpacity
            style={[styles.tabButton, isLogin && styles.activeTab]}
            onPress={()=> setIsLogin(true)}
            >
              <Text style={[
                styles.tabText,
                isLogin ? styles.activeTabText : styles.inactiveTabText,
                ]}>
                  Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[styles.tabButton, !isLogin && styles.activeTab]}
            onPress={() => setIsLogin(false)}
            >
              <Text style={[
                styles.tabText, 
                !isLogin ? styles.activeTabText : styles.inactiveTabText
                ]}>
                  Sign Up
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor='#AAAAAA'
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            />
            {!isLogin && (
              <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
              />
            )}
            <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#AAAAAA"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            />
            {!isLogin && (
              <TextInput
              style={styles.input}
              placeholder="Retype Password"
              placeholderTextColor="#AAAAAA"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              />
            )}
          </View>
          {isLogin && (
            <View style={styles.forgotContainer}>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsLogin(false)}>
                <Text style={styles.createText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          )}
          {!isLogin && (
            <View style={styles.alreadyUserContainer}>
              <TouchableOpacity onPress={() => setIsLogin(true)}>
                <Text style={styles.alreadyUserText}>Already User</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? 'Login' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>
            {/* <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialAuth('Google')}
              >
                <View style={styles.socialIconContainer}>
                  <Text style={styles.socialIconText}>G</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialAuth('Facebook')}
              >
                <View style={styles.socialIconContainer}>
                  <Text style={styles.socialIconText}>f</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialAuth('Twitter')}
              >
                <View style={styles.socialIconContainer}>
                  <Text style={styles.socialIconText}>t</Text>
                </View>
              </TouchableOpacity>
            </View> */}
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    height: '35%',
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: FONT_SIZES.h1,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  formContainer: {
    flex: 1,
    marginTop: -50,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.medium,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  inactiveTabText: {
    color: COLORS.gray,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  forgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  forgotText: {
    color: COLORS.gray,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body2,
  },
  createText: {
    color: COLORS.gray,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body2,
  },
  alreadyUserContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  alreadyUserText: {
    color: COLORS.gray,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body2,
  },
  authButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  authButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.semiBold,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  socialButton: {
    marginHorizontal: 15,
  },
  socialIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  socialIconText: {
    fontSize: FONT_SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  appTitle: {
    fontSize: FONT_SIZES.h1,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 8,
  },
  switchButton: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  errorText: {
    fontSize: FONT_SIZES.h3,
    fontFamily: FONTS.medium,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  authInput: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  errorMessage: {
    fontSize: FONT_SIZES.h3,
    fontFamily: FONTS.medium,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
})