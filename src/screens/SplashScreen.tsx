import { View, Text, StyleSheet, StatusBar, Image } from 'react-native'
import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface SplashProps{
  navigation: any;
}

export default function SplashScreen({navigation}:SplashProps) {
    useEffect(() => {
      const checkAuth = async () => {
        try{
           // Simulate loading delay
          await new Promise(resolve => setTimeout(resolve, 2000));

          // check if user is logged in
          const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');

          // navigate based on auth status
          if(userLoggedIn === 'true'){
            navigation.reset({
              index: 0,
              routes: [{name: 'Tabs'}],
            });
          }
          else{
            navigation.reset({
              index:0,
              routes: [{name: 'Auth'}],
            });
          }
        }
        catch(error){
          // console.error('Error checking auth status: ',error); // Remove or comment out for production
          navigation.navigate('Auth')
        }
      };
      checkAuth()
    }, [navigation]);
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <LinearGradient 
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradient}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode='contain'
              />
            </View>
          </View>
        </LinearGradient>
      </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
});