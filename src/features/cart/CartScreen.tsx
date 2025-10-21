import React from "react";
import { View, FlatList, Image } from "react-native";
import { Text, Button, Card, Divider } from "react-native-paper";
import { useCartStore } from "../../store";
import { supabase } from "../../lib";

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
    <View
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f6fa",
      }}
    >
      <Text
        variant="headlineSmall"
        style={{
          fontWeight: "700",
          marginBottom: 6,
        }}
      >
        Twój koszyk
      </Text>
      <Text style={{ color: "#666", marginBottom: 16 }}>
        Sprawdź produkty przed złożeniem zamówienia
      </Text>

      {items.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 16, opacity: 0.6 }}>
            Twój koszyk jest pusty
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => (
              <Card
                style={{
                  marginBottom: 12,
                  borderRadius: 10,
                  backgroundColor: "#fff",
                }}
              >
                <Card.Content
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        marginBottom: 4,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text style={{ color: "#555", marginBottom: 2 }}>
                      Ilość: {item.quantity}
                    </Text>
                    <Text style={{ fontWeight: "600" }}>
                      {(item.price * item.quantity).toFixed(2)} zł
                    </Text>
                  </View>

                  <Button
                    textColor="#d63031"
                    onPress={() => removeFromCart(item.id)}
                  >
                    Usuń
                  </Button>
                </Card.Content>
              </Card>
            )}
          />

          <Divider style={{ marginVertical: 16 }} />

          <View
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 12,
              elevation: 2,
            }}
          >
            <Text
              variant="titleMedium"
              style={{
                textAlign: "right",
                fontWeight: "600",
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              Suma: {totalPrice().toFixed(2)} zł
            </Text>

            <Button
              mode="contained"
              onPress={handleOrder}
              style={{
                borderRadius: 10,
                paddingVertical: 6,
                marginTop: 4,
              }}
            >
              Złóż zamówienie
            </Button>
          </View>
        </>
      )}
    </View>
  );
}
