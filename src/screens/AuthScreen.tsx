import { COLORS, FONTS } from "@constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

interface AuthProps{
  navigation:any;
}

export default function AuthScreen({navigation}:AuthProps){
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [username, setusername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    Keyboard.dismiss();
  

  // input validation
  if(!email.trim()){
    Alert.alert('Error', 'Please enter your email');
    return;
  }
  if(!password.trim()){
    Alert.alert('Error', 'Please enter your password');
    return;
  }

  if(!isLogin){
    if(!username.trim()){
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    if(password !== confirmPassword){
      Alert.alert('Error', 'Passwords do not match')
      return;
    }
  }
  setLoading(true);

  try{
    // simulate api delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // store Logged in state
    await AsyncStorage.setItem('userLoggedIn', 'true');

    // store user info
    const userData = {
      email,
      username: isLogin ? 'Nikhil' : username,
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));

    // Navigate to home screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs' }],
    });

  }
  catch(error){
    console.error('Authentication error: ', error);
    Alert.alert('Error', 'Authentication failed. Please try again');
  }
  finally{
    setLoading(false);
  }
}
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
          {
            !isLogin && (
              <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="none"
              value={username}
              onChangeText={setusername}
              />
            )
          }
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
            <TouchableOpacity onPress={() => Alert.alert('Password Recovery', 'TODO')}>
              <Text style={styles.forgotText}> Forgot Text </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLogin(false)}>
              <Text style={styles.createText}> Create Account </Text>
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
          <View style={styles.socialContainer}>
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
          </View>
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
    fontSize: 30,
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
    fontSize: 16,
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
    backgroundColor: COLORS.background,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  forgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  forgotText: {
    color: COLORS.gray,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  createText: {
    color: COLORS.gray,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  alreadyUserContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  alreadyUserText: {
    color: COLORS.gray,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  authButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingVertical: 14,
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
    fontSize: 18,
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
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
})