import "./i18n";

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider, Icon } from "react-native-paper";
import { useAuthStore } from "./store/useAuthStore";
import { SnackbarProvider } from "./providers/SnackbarProvider";
import { useTranslation } from "react-i18next";

import LoginScreen from "./features/auth/LoginScreen";
import RegisterScreen from "./features/auth/RegisterScreen";
import HomeScreen from "./features/products/HomeScreen";
import CartScreen from "./features/cart/CartScreen";
import OrdersScreen from "./features/orders/OrdersScreens";
import ProfileScreen from "./features/profile/ProfileScreen";
import CartIconWithBadge from "./components/CartIconWithBadge";
import FavoritesScreen from "./features/favorites/FavoritesScreen";
import ProductDetailScreen from "./features/products/ProductDetailScreen";
import SplashScreen from "./features/auth/SplashScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  const { t } = useTranslation();

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
          title: t("home.title"),
          tabBarIcon: ({ color, size }) => (
            <Icon source="store-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: t("cart.title"),
          tabBarIcon: () => <CartIconWithBadge />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: t("orders.title"),
          tabBarIcon: ({ color, size }) => (
            <Icon source="clipboard-list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: t("favorites.title"),
          tabBarIcon: ({ color, size }) => (
            <Icon source="heart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t("profile.title"),
          tabBarIcon: ({ color, size }) => (
            <Icon source="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { session, loading, fetchSession } = useAuthStore();
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    fetchSession();

    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading || splashVisible) {
    return <SplashScreen />;
  }

  return (
    <PaperProvider>
      <SnackbarProvider>
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
                  options={{ headerShown: true }}
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
      </SnackbarProvider>
    </PaperProvider>
  );
}
