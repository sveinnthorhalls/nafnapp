import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import LoginScreen from './src/screens/LoginScreen';
import CreateCoupleScreen from './src/screens/CreateCoupleScreen';
import JoinCoupleScreen from './src/screens/JoinCoupleScreen';
import PersonalLikesScreen from './src/screens/PersonalLikesScreen';

// Define the navigation types
export type RootStackParamList = {
  Login: undefined;
  CreateCouple: undefined;
  JoinCouple: undefined;
  Home: undefined;
  Matches: { coupleId: string | null };
  PersonalLikes: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return () => unsubscribe();
  }, [initializing]);

  if (initializing) {
    return null; // or a loading screen
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName={user ? 'Home' : 'Login'}
            screenOptions={{
              headerShown: false,
            }}
          >
            {/* Auth Screens */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CreateCouple" component={CreateCoupleScreen} />
            <Stack.Screen name="JoinCouple" component={JoinCoupleScreen} />
            
            {/* App Screens */}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Matches" component={MatchesScreen} />
            <Stack.Screen name="PersonalLikes" component={PersonalLikesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
