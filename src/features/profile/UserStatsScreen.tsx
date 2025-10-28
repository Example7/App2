import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { supabase } from "../../lib";
import { useAuthStore } from "../../store/useAuthStore";
import { useTranslation } from "react-i18next";
import { LoadingView } from "../../components";

const screenWidth = Dimensions.get("window").width;

export default function UserStatsScreen() {
  const { t } = useTranslation();
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user?.id) fetchUserStats();
  }, [session]);

  const fetchUserStats = async () => {
    setLoading(true);

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, total")
      .eq("user_id", session.user.id);

    if (error || !orders) {
      setLoading(false);
      return;
    }

    setOrderCount(orders.length);
    setTotalSpent(orders.reduce((sum, o) => sum + Number(o.total), 0));

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .in(
        "order_id",
        orders.map((o) => o.id)
      );

    if (orderItems && orderItems.length > 0) {
      const grouped = orderItems.reduce((acc: any, item: any) => {
        acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity;
        return acc;
      }, {});

      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .in("id", Object.keys(grouped));

      const mapped = products?.map((p: any) => ({
        label: p.name,
        value: grouped[p.id],
      }));

      setTopProducts(mapped || []);
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingView message={t("userStats.loading")} />;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f9f9f9" }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        {t("userStats.title")}
      </Text>

      <View
        style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
          {t("userStats.orderCount")}:{" "}
          <Text style={{ color: "#1976d2" }}>{orderCount}</Text>
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#333",
            marginTop: 6,
          }}
        >
          {t("userStats.totalSpent")}:{" "}
          <Text style={{ color: "#4caf50" }}>{totalSpent.toFixed(2)} zł</Text>
        </Text>
      </View>

      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
        {t("userStats.topProducts")}
      </Text>

      {topProducts.length > 0 ? (
        <BarChart
          data={{
            labels: topProducts.map((p) => p.label),
            datasets: [{ data: topProducts.map((p) => p.value) }],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
            labelColor: () => "#333",
          }}
          style={{ borderRadius: 12 }}
        />
      ) : (
        <Text style={{ color: "#777", fontStyle: "italic" }}>
          {t("userStats.noData")}
        </Text>
      )}
    </ScrollView>
  );
}
