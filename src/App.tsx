import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Provider as PaperProvider,
  ActivityIndicator,
  Text,
  Icon,
} from "react-native-paper";
import { View } from "react-native";
import { supabase } from "./lib/supabase";

import LoginScreen from "./features/auth/LoginScreen";
import RegisterScreen from "./features/auth/registerScreen";
import HomeScreen from "./features/products/HomeScreen";
import CartScreen from "./features/cart/CartScreen";
import OrdersScreen from "./features/orders/OrdersScreens";
import ProfileScreen from "./features/profile/ProfileScreen";
import CartIconWithBadge from "./components/CartIconWithBadge";
import FavoritesScreen from "./features/favorites/FavoritesScreen";
import ProductDetailScreen from "./features/products/ProductDetailScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1976d2",
        tabBarInactiveTintColor: "#777",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Sklep",
          tabBarIcon: ({ color, size }) => (
            <Icon source="store-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: "Koszyk",
          tabBarIcon: () => <CartIconWithBadge />,
        }}
      />

      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: "Zamówienia",
          tabBarIcon: ({ color, size }) => (
            <Icon source="clipboard-list-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "Ulubione",
          tabBarIcon: ({ color, size }) => (
            <Icon source="heart-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Icon source="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Wczytywanie...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {session ? (
            <>
              <Stack.Screen
                name="AppTabs"
                component={AppTabs}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="ProductDetails"
                component={ProductDetailScreen}
                options={{
                  headerShown: true,
                  title: "Szczegóły produktu",
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
