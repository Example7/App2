import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import {
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserStats();
    }
  }, [session]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, total")
        .eq("user_id", session.user.id);

      if (ordersError) throw new Error(ordersError.message);
      if (!orders || orders.length === 0) {
        setOrderCount(0);
        setTotalSpent(0);
        setTopProducts([]);
        setLoading(false);
        return;
      }

      setOrderCount(orders.length);

      const total = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      setTotalSpent(total);

      const orderIds = orders.map((o) => o.id).filter(Boolean);
      if (orderIds.length === 0) {
        setTopProducts([]);
        setLoading(false);
        return;
      }

      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .in("order_id", orderIds);

      if (itemsError) throw new Error(itemsError.message);

      if (!orderItems || orderItems.length === 0) {
        setTopProducts([]);
        setLoading(false);
        return;
      }

      const grouped = orderItems.reduce((acc: any, item: any) => {
        acc[item.product_id] =
          (acc[item.product_id] || 0) + (item.quantity || 0);
        return acc;
      }, {});

      const productIds = Object.keys(grouped);
      if (productIds.length === 0) {
        setTopProducts([]);
        setLoading(false);
        return;
      }

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);

      if (productsError) throw new Error(productsError.message);

      const mapped =
        products?.map((p: any) => ({
          x: p.name,
          y: grouped[p.id] || 0,
        })) || [];

      setTopProducts(mapped.filter((item) => item.y > 0));
    } catch (error: any) {
      console.error("Błąd ładowania statystyk użytkownika:", error.message);
      setErrorMsg("Nie udało się pobrać statystyk. Spróbuj ponownie później.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingView message={t("userStats.loading")} />;
  }

  if (errorMsg) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9f9f9",
          padding: 20,
        }}
      >
        <Text style={{ color: "#e74c3c", textAlign: "center" }}>
          {errorMsg}
        </Text>
      </View>
    );
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
            x="x"
            y="y"
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
