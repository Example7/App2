import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import {
  VictoryPie,
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel,
} from "victory-native";
import { supabase } from "../../lib";
import { useAuthStore } from "../../store/useAuthStore";
import { useTranslation } from "react-i18next";
import { LoadingView } from "../../components";

export default function UserStatsScreen() {
  const { t } = useTranslation();
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserStats();
    }
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

    const total = orders.reduce((sum, o) => sum + Number(o.total), 0);
    setTotalSpent(total);

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
        x: p.name,
        y: grouped[p.id],
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
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={20}
          animate={{ duration: 800 }}
        >
          <VictoryAxis
            style={{ tickLabels: { fontSize: 10, angle: 45, padding: 15 } }}
          />
          <VictoryAxis dependentAxis />
          <VictoryBar
            data={topProducts}
            style={{ data: { fill: "#ff9800", borderRadius: 4 } }}
            labels={({ datum }: any) => datum.y}
            labelComponent={<VictoryLabel dy={-10} />}
          />
        </VictoryChart>
      ) : (
        <Text style={{ color: "#777", fontStyle: "italic" }}>
          {t("userStats.noData")}
        </Text>
      )}
    </ScrollView>
  );
}
