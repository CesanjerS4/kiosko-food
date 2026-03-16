import React, { useState, createContext, useContext } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from './src/theme';
import { AppProvider } from './src/context/AppContext';
import LoginScreen from './src/screens/LoginScreen';
import PosScreen from './src/screens/PosScreen';
import KdsScreen from './src/screens/KdsScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import CashScreen from './src/screens/CashScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export const AuthContext = createContext({ isLoggedIn: false, login: () => {}, logout: () => {} });

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.divider,
    primary: Colors.accent,
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.divider,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            ORDEN: focused ? 'storefront' : 'storefront-outline',
            KDS: focused ? 'restaurant' : 'restaurant-outline',
            Inventario: focused ? 'cube' : 'cube-outline',
            Caja: focused ? 'wallet' : 'wallet-outline',
            Ajustes: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="ORDEN" component={PosScreen} />
      <Tab.Screen name="KDS" component={KdsScreen} />
      <Tab.Screen name="Inventario" component={InventoryScreen} />
      <Tab.Screen name="Caja" component={CashScreen} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const authValue = {
    isLoggedIn,
    login: () => setIsLoggedIn(true),
    logout: () => setIsLoggedIn(false),
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AuthContext.Provider value={authValue}>
          <StatusBar style="light" backgroundColor={Colors.background} />
          <NavigationContainer theme={navTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
              {!isLoggedIn ? (
                <Stack.Screen name="Login" component={LoginScreen} />
              ) : (
                <Stack.Screen name="Main" component={TabNavigator} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </AuthContext.Provider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
