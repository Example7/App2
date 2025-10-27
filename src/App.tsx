import "react-native-gesture-handler";
import "react-native-reanimated";
import "./i18n";
import * as Sentry from "sentry-expo";
import {
  ReactNavigationInstrumentation,
  ReactNativeTracing,
} from "@sentry/react-native";

import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Provider as PaperProvider,
  Icon,
  MD3LightTheme,
} from "react-native-paper";
import { useAuthStore } from "./store/useAuthStore";
import { SnackbarProvider } from "./providers/SnackbarProvider";
import { useTranslation } from "react-i18next";
import { AnimationsScreen } from "./features/animations";

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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DashboardScreen from "./features/dashboard/DashboardScreen";
import UserStatsScreen from "./features/profile/UserStatsScreen";

const routingInstrumentation = new ReactNavigationInstrumentation();

Sentry.init({
  dsn: "https://c69df73fb8beb254b2e81b6cda633757@o4510232972361728.ingest.de.sentry.io/4510232974065744",
  enableInExpoDevelopment: true,
  debug: true,
  tracesSampleRate: 1.0,
  integrations: [
    new ReactNativeTracing({
      routingInstrumentation,
    }),
  ],
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    onBackground: "#000",
    onSurface: "#000",
    outline: "#aaa",
    primary: "#1976d2",
    secondary: "#4caf50",
  },
};

function AppTabs() {
  const { t } = useTranslation();
  const { role } = useAuthStore();

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
      <Tab.Screen
        name="Animations"
        component={AnimationsScreen}
        options={{
          title: t("animations.title", { defaultValue: "Animacje" }),
          tabBarIcon: ({ color, size }) => (
            <Icon source="animation-outline" color={color} size={size} />
          ),
        }}
      />
      {role === "admin" && (
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: t("dashboard.title", { defaultValue: "Dashboard" }),
            tabBarIcon: ({ color, size }) => (
              <Icon source="chart-bar" color={color} size={size} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function App() {
  const { t } = useTranslation();
  const { session, loading, fetchSession } = useAuthStore();
  const [splashVisible, setSplashVisible] = useState(true);
  const navigationRef = useRef(null);

  useEffect(() => {
    fetchSession();
    const timer = setTimeout(() => setSplashVisible(false), 1500);
    Sentry.Native.captureMessage("Testowa wiadomość z Expo App2");
    return () => clearTimeout(timer);
  }, []);

  if (loading || splashVisible) return <SplashScreen />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <SnackbarProvider>
          <NavigationContainer
            ref={navigationRef}
            onReady={() =>
              routingInstrumentation.registerNavigationContainer(navigationRef)
            }
          >
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
                  <Stack.Screen
                    name="UserStats"
                    component={UserStatsScreen}
                    options={{
                      title: t("userStats.title", {
                        defaultValue: "Twoje statystyki",
                      }),
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
        </SnackbarProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
