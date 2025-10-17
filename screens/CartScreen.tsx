import React from "react";
import { View, FlatList } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { useCartStore } from "../store/useCartStore";
import { supabase } from "../lib/supabase";

export default function CartScreen() {
  const { items, removeFromCart, clearCart, totalPrice } = useCartStore();

  const handleOrder = async () => {
    if (items.length === 0) {
      alert("Koszyk jest pusty!");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("Musisz być zalogowany, aby złożyć zamówienie!");
      return;
    }

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{ user_id: user.id, total }])
      .select()
      .single();

    if (orderError) {
      console.error(orderError);
      alert("Nie udało się utworzyć zamówienia!");
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error(itemsError);
      alert("Nie udało się zapisać produktów zamówienia!");
      return;
    }

    clearCart();
    alert("Zamówienie zostało złożone!");
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <Text variant="headlineSmall" style={{ marginBottom: 10 }}>
        Twój koszyk
      </Text>

      {items.length === 0 ? (
        <Text>Koszyk jest pusty.</Text>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Card style={{ marginBottom: 10 }}>
                <Card.Title title={item.name} />
                <Card.Content>
                  <Text>Ilość: {item.quantity}</Text>
                  <Text>Cena: {item.price * item.quantity} zł</Text>
                </Card.Content>
                <Card.Actions>
                  <Button
                    textColor="red"
                    onPress={() => removeFromCart(item.id)}
                  >
                    Usuń
                  </Button>
                </Card.Actions>
              </Card>
            )}
          />

          <Text
            variant="titleMedium"
            style={{ marginTop: 10, textAlign: "right" }}
          >
            Suma: {totalPrice()} zł
          </Text>

          <Button
            mode="contained"
            style={{ marginTop: 20 }}
            onPress={handleOrder}
          >
            Złóż zamówienie
          </Button>
        </>
      )}
    </View>
  );
}
