import * as React from "react";
import {
  Provider as PaperProvider,
  BottomNavigation,
} from "react-native-paper";
import HomeScreen from "./screens/HomeScreen";
import CartScreen from "./screens/CartScreen";
import OrdersScreen from "./screens/OrdersScreens";

export default function App() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "home", title: "Sklep", focusedIcon: "store" },
    { key: "cart", title: "Koszyk", focusedIcon: "cart-outline" },
    {
      key: "orders",
      title: "Zamówienia",
      focusedIcon: "clipboard-list-outline",
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    cart: CartScreen,
    orders: OrdersScreen,
  });

  return (
    <PaperProvider>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={(i) => {
          setIndex(i);
          if (routes[i].key === "orders") {
            setTimeout(() => {
              window.dispatchEvent(new Event("refreshOrders"));
            }, 0);
          }
        }}
        renderScene={renderScene}
        sceneAnimationEnabled={true}
        shifting={true}
      />
    </PaperProvider>
  );
}
