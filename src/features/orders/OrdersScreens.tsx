import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text, Card, Divider } from "react-native-paper";
import { supabase, formatDate, formatPrice, shortId } from "../../lib";
import { Order, OrderItem } from "../../types";
import { LoadingView, EmptyState } from "../../components";
import { useTranslation } from "react-i18next";
import * as Sentry from "sentry-expo";

type FilterKey = "all" | "in_progress" | "completed" | "cancelled";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const { t } = useTranslation();

  const [filter, setFilter] = useState<FilterKey>("all");

  const statusMap: Record<FilterKey, string> = {
    all: "all",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled",
  };

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
      alert(t("cart.loginRequired"));
      setLoading(false);
      return;
    }

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: sortOrder === "asc" });

    if (ordersError) {
      Sentry.Native.captureException(ordersError);
      alert(t("common.error"));
      setLoading(false);
      return;
    }

    let filtered = ordersData || [];
    if (filter !== "all") {
      filtered = filtered.filter((o) => o.status === statusMap[filter]);
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
        Sentry.Native.captureException(itemsError);
        alert(t("orders.itemsError"));
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
      case "completed":
        return "#2ecc71";
      case "cancelled":
        return "#e74c3c";
      default:
        return "#f1c40f";
    }
  };

  if (loading) return <LoadingView message={t("common.loading")} />;

  return (
    <ScrollView
      style={{ flex: 1, padding: 16, backgroundColor: "#f5f6fa" }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 6, marginTop: 18 }}
      >
        {t("orders.title")}
      </Text>
      <Text style={{ color: "#666", marginBottom: 20 }}>
        {t("orders.subtitle", { defaultValue: "Browse your order history" })}
      </Text>

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
            {t("orders.filter")}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {[
              { key: "all", label: t("orders.all", { defaultValue: "All" }) },
              { key: "inProgress", label: t("orders.in_progress") },
              { key: "completed", label: t("orders.completed") },
              {
                key: "cancelled",
                label: t("orders.cancelled", { defaultValue: "Cancelled" }),
              },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setFilter(option.key as FilterKey)}
                style={{
                  backgroundColor:
                    filter === option.key ? "#4caf50" : "transparent",
                  borderWidth: 1,
                  borderColor:
                    filter === option.key ? "#4caf50" : "rgba(0,0,0,0.2)",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: filter === option.key ? "#fff" : "#333",
                    fontWeight: filter === option.key ? "600" : "400",
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            variant="titleSmall"
            style={{ marginBottom: 8, fontWeight: "600" }}
          >
            {t("orders.sort")}
          </Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {[
              {
                label: t("orders.newest", { defaultValue: "Newest" }),
                value: "desc",
              },
              {
                label: t("orders.oldest", { defaultValue: "Oldest" }),
                value: "asc",
              },
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

      {orders.length === 0 ? (
        <EmptyState
          icon="clipboard-list-outline"
          message={t("orders.noOrders")}
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
                title={`${t("orders.order")} #${shortId(order.id)}`}
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
                    {t(`orders.${order.status}`)}
                  </Text>
                )}
              />
              <Divider />
              <Card.Content style={{ paddingTop: 8 }}>
                {items.length > 0 ? (
                  items.map((item) => (
                    <Text key={item.id} style={{ marginVertical: 2 }}>
                      • {item.products?.name || t("orders.product")} x{" "}
                      {item.quantity} —{" "}
                      {formatPrice(item.price * item.quantity)}
                    </Text>
                  ))
                ) : (
                  <Text>
                    {t("orders.noItems", {
                      defaultValue: "No items in this order.",
                    })}
                  </Text>
                )}

                <Divider style={{ marginVertical: 8 }} />
                <Text
                  style={{
                    textAlign: "right",
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {t("orders.total")}: {formatPrice(order.total)}
                </Text>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}
