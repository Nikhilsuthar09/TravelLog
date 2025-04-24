import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

type User = {
  email: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login:(email: string, password:string) => Promise<void>;
  signup: (email:string, username:string, password:string) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface Props{
  children: ReactNode;
}

export const AuthProvider = ({children}: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadUser = async () => {
      try{
        const userDataString = await AsyncStorage.getItem('userData');
        if(userDataString){
          setUser(JSON.parse(userDataString));
        }
      }
      catch(e){
        console.error('Failed to load user data', e)
      }
      finally{
        setIsLoading(false);
      }
    }
    loadUser();
  }, [])
  const login = async(email:string, password:string) => {
    setIsLoading(true);
    try{
      const userData = {
        email,
        username: 'Nikhil'
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    await AsyncStorage.setItem('userLoggedIn', 'true');
    setUser(userData);
  } 
  catch(error){
    console.error('Login failed', error);
    throw new Error('Login Failed')
  }
  finally{
    setIsLoading(false)
  }
}
const signup = async (email: string, username: string, password:string)=> {
  setIsLoading(true);
  try{
    const userData = {
      email,
      username,
    }
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    await AsyncStorage.setItem('userLoggedIn', 'true');
    setUser(userData)
  }
  catch(e){
    console.error('Signup failed', e);
    throw new Error('Signup failed');
  }
  finally{
    setIsLoading(false);
  }
}

const logout = async () => {
  try{
    await AsyncStorage.removeItem('userLoggedIn');
    await AsyncStorage.removeItem('userData');
    setUser(null)
  }
  catch(e){
    console.error('Logout failed',e);
  }
}
return (
  <AuthContext.Provider
  value={{
    user,
    isLoading,
    login,
    signup,
    logout
  }}
  >
    {children}
  </AuthContext.Provider>
)
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if(!context){
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}