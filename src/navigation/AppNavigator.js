import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import PaymentFailureScreen from '../screens/PaymentFailureScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Home and Product Details
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ 
          title: 'Product Details',
          headerStyle: { backgroundColor: '#f8f9fa' },
          headerTintColor: '#333',
        }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator for Cart and Checkout
function CartStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CartMain" 
        component={CartScreen}
        options={{ title: 'Shopping Cart' }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen 
        name="PaymentSuccess" 
        component={PaymentSuccessScreen}
        options={{ 
          title: 'Payment Success',
          headerLeft: null, // Disable back button
          gestureEnabled: false, // Disable swipe back
        }}
      />
      <Stack.Screen 
        name="PaymentFailure" 
        component={PaymentFailureScreen}
        options={{ 
          title: 'Payment Failed',
          headerLeft: null, // Disable back button
          gestureEnabled: false, // Disable swipe back
        }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator for Profile and Auth
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="CartTab" 
        component={CartStack}
        options={{ title: 'Cart' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}