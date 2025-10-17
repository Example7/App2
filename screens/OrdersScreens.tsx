import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import { supabase } from "../lib/supabase";

type Order = {
  id: number;
  created_at: string;
  total: number;
  status: string;
};

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  products: {
    name: string;
  };
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<string>("Wszystkie");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [filter, sortOrder]);

  const fetchOrders = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      alert("Musisz być zalogowany, aby zobaczyć swoje zamówienia!");
      setLoading(false);
      return;
    }

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: sortOrder === "asc" });

    if (ordersError) {
      console.error(ordersError);
      alert("Nie udało się pobrać zamówień!");
      setLoading(false);
      return;
    }

    let filtered = ordersData || [];
    if (filter !== "Wszystkie") {
      filtered = filtered.filter((o) => o.status === filter);
    }

    setOrders(filtered);

    if (filtered.length > 0) {
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*, products(name)")
        .in(
          "order_id",
          filtered.map((o) => o.id)
        );

      if (itemsError) {
        console.error(itemsError);
        alert("Nie udało się pobrać pozycji zamówień!");
      } else {
        setOrderItems(itemsData || []);
      }
    } else {
      setOrderItems([]);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" />
        <Text>Wczytywanie zamówień...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}
      showsVerticalScrollIndicator={false}
    >
      <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
        Moje zamówienia
      </Text>

      <View
        style={{
          flexDirection: "row",
          marginBottom: 20,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text variant="titleSmall" style={{ marginBottom: 6 }}>
            Filtruj status:
          </Text>
          <Card style={{ padding: 8 }}>
            {["Wszystkie", "W realizacji", "Zakończone", "Anulowane"].map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFilter(status)}
                >
                  <Text
                    style={{
                      paddingVertical: 2,
                      color: filter === status ? "#4caf50" : "#333",
                      fontWeight: filter === status ? "bold" : "normal",
                    }}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </Card>
        </View>

        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={{ marginBottom: 6 }}>
            Sortuj wg daty:
          </Text>
          <Card style={{ padding: 8 }}>
            {[
              { label: "Od najnowszych", value: "desc" },
              { label: "Od najstarszych", value: "asc" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSortOrder(option.value as "asc" | "desc")}
              >
                <Text
                  style={{
                    paddingVertical: 2,
                    color: sortOrder === option.value ? "#4caf50" : "#333",
                    fontWeight: sortOrder === option.value ? "bold" : "normal",
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      </View>

      {orders.length === 0 ? (
        <Text>Nie masz jeszcze żadnych zamówień.</Text>
      ) : (
        orders.map((order) => {
          const items = orderItems.filter((i) => i.order_id === order.id);
          return (
            <Card key={order.id} style={{ marginBottom: 16 }}>
              <Card.Title
                title={`Zamówienie #${order.id}`}
                subtitle={`Data: ${new Date(
                  order.created_at
                ).toLocaleString()}`}
                left={() => {
                  const color =
                    order.status === "Zakończone"
                      ? "green"
                      : order.status === "Anulowane"
                      ? "red"
                      : "orange";
                  return <Text style={{ fontSize: 22, color }}>⬤</Text>;
                }}
              />

              <Card.Content>
                {items.length > 0 ? (
                  items.map((item) => (
                    <Text key={item.id}>
                      • {item.products?.name || "Produkt"} x {item.quantity} —{" "}
                      {item.price * item.quantity} zł
                    </Text>
                  ))
                ) : (
                  <Text>Brak pozycji w tym zamówieniu.</Text>
                )}

                <Text style={{ marginTop: 8, fontWeight: "bold" }}>
                  Status:{" "}
                  <Text
                    style={{
                      color:
                        order.status === "Zakończone"
                          ? "green"
                          : order.status === "Anulowane"
                          ? "red"
                          : "orange",
                    }}
                  >
                    {order.status}
                  </Text>
                </Text>

                <Text
                  style={{
                    textAlign: "right",
                    marginTop: 8,
                    fontWeight: "bold",
                  }}
                >
                  Suma: {order.total} zł
                </Text>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}
