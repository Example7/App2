import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text, Card, Divider } from "react-native-paper";
import { supabase, formatDate, formatPrice, shortId } from "../../lib";
import { Order, OrderItem } from "../../types";
import { LoadingView, EmptyState } from "../../components";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("Wszystkie");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    fetchOrders();
  }, [filter, sortOrder]);

  useEffect(() => {
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Zakończone":
        return "#2ecc71";
      case "Anulowane":
        return "#e74c3c";
      default:
        return "#f1c40f";
    }
  };

  // ⏳ Loader
  if (loading) return <LoadingView message="Wczytywanie zamówień..." />;

  // 🧾 Główny widok
  return (
    <ScrollView
      style={{ flex: 1, padding: 16, backgroundColor: "#f5f6fa" }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 6 }}
      >
        Moje zamówienia
      </Text>
      <Text style={{ color: "#666", marginBottom: 20 }}>
        Przeglądaj historię swoich zamówień
      </Text>

      {/* 🔍 Filtry i sortowanie */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            variant="titleSmall"
            style={{ marginBottom: 8, fontWeight: "600" }}
          >
            Filtr statusu
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {["Wszystkie", "W realizacji", "Zakończone", "Anulowane"].map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFilter(status)}
                  style={{
                    backgroundColor:
                      filter === status ? "#4caf50" : "transparent",
                    borderWidth: 1,
                    borderColor:
                      filter === status ? "#4caf50" : "rgba(0,0,0,0.2)",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: filter === status ? "#fff" : "#333",
                      fontWeight: filter === status ? "600" : "400",
                    }}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            variant="titleSmall"
            style={{ marginBottom: 8, fontWeight: "600" }}
          >
            Sortowanie
          </Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {[
              { label: "Najnowsze", value: "desc" },
              { label: "Najstarsze", value: "asc" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSortOrder(option.value as "asc" | "desc")}
                style={{
                  backgroundColor:
                    sortOrder === option.value ? "#2196f3" : "transparent",
                  borderWidth: 1,
                  borderColor:
                    sortOrder === option.value ? "#2196f3" : "rgba(0,0,0,0.2)",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: sortOrder === option.value ? "#fff" : "#333",
                    fontWeight: sortOrder === option.value ? "600" : "400",
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* 🧾 Lista zamówień */}
      {orders.length === 0 ? (
        <EmptyState
          icon="clipboard-list-outline"
          message="Nie masz jeszcze żadnych zamówień"
        />
      ) : (
        orders.map((order) => {
          const items = orderItems.filter((i) => i.order_id === order.id);
          const color = getStatusColor(order.status);

          return (
            <Card
              key={order.id}
              style={{
                marginBottom: 16,
                borderRadius: 14,
                backgroundColor: "#fff",
                elevation: 3,
              }}
            >
              <Card.Title
                title={`Zamówienie #${shortId(order.id)}`}
                subtitle={formatDate(order.created_at)}
                right={() => (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color,
                      marginRight: 10,
                    }}
                  >
                    {order.status}
                  </Text>
                )}
              />
              <Divider />
              <Card.Content style={{ paddingTop: 8 }}>
                {items.length > 0 ? (
                  items.map((item) => (
                    <Text key={item.id} style={{ marginVertical: 2 }}>
                      • {item.products?.name || "Produkt"} x {item.quantity} —{" "}
                      {formatPrice(item.price * item.quantity)}
                    </Text>
                  ))
                ) : (
                  <Text>Brak pozycji w tym zamówieniu.</Text>
                )}

                <Divider style={{ marginVertical: 8 }} />
                <Text
                  style={{
                    textAlign: "right",
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  Suma: {formatPrice(order.total)}
                </Text>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}
