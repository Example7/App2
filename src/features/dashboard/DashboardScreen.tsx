import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { supabase } from "../../lib";
import { useAuthStore } from "../../store/useAuthStore";
import { useTranslation } from "react-i18next";
import {
  VictoryBar,
  VictoryPie,
  VictoryLine,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryLabel,
} from "victory-native";

export default function DashboardScreen() {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuthStore();

  useEffect(() => {
    if (role === "admin") {
      fetchStats();
    }
  }, [role]);

  const fetchStats = async () => {
    setLoading(true);

    const { data: orders, error } = await supabase
      .from("orders")
      .select("status, total, created_at");

    if (error) {
      console.error("Błąd pobierania statystyk:", error.message);
      setLoading(false);
      return;
    }

    if (!orders || orders.length === 0) {
      setChartData([]);
      setDailyData([]);
      setPieData([]);
      setLoading(false);
      return;
    }

    const grouped = orders.reduce((acc: any, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + Number(o.total || 0);
      return acc;
    }, {});
    const barData = Object.entries(grouped).map(([status, total]) => ({
      status,
      total,
    }));

    const daily = orders.reduce((acc: any, o: any) => {
      const date = o.created_at?.split("T")[0];
      if (date) acc[date] = (acc[date] || 0) + Number(o.total || 0);
      return acc;
    }, {});
    const lineData = Object.entries(daily).map(([date, total]) => ({
      date,
      total,
    }));

    const totalSum = Object.values(grouped).reduce(
      (sum: number, val: any) => sum + Number(val || 0),
      0
    );
    const pie = Object.entries(grouped).map(([status, total]) => ({
      x: status,
      y: totalSum > 0 ? Math.round((Number(total) / totalSum) * 100) : 0,
    }));

    setChartData(barData);
    setDailyData(lineData);
    setPieData(pie);
    setLoading(false);
  };

  if (role !== "admin") {
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
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#e74c3c" }}>
          {t("dashboard.noAccessTitle")}
        </Text>
        <Text style={{ textAlign: "center", color: "#555", marginTop: 8 }}>
          {t("dashboard.noAccessText")}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Text>{t("dashboard.loading") || "Wczytywanie danych..."}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f9f9f9" }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        {t("dashboard.title")}
      </Text>

      {chartData.length > 0 ? (
        <>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
            {t("dashboard.ordersByStatus")}
          </Text>
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={25}
            animate={{ duration: 800 }}
          >
            <VictoryAxis
              style={{ tickLabels: { fontSize: 12, angle: 0, padding: 8 } }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(x: number) => `${x} zł`}
              style={{ tickLabels: { fontSize: 10 } }}
            />
            <VictoryBar
              data={chartData}
              x="status"
              y="total"
              style={{ data: { fill: "#4caf50", borderRadius: 4 } }}
              labels={({ datum }: any) => `${datum.total} zł`}
              labelComponent={<VictoryLabel dy={-10} />}
            />
          </VictoryChart>
        </>
      ) : (
        <Text style={{ color: "#777", fontStyle: "italic" }}>
          {t("dashboard.noData")}
        </Text>
      )}

      {dailyData.length > 0 && (
        <>
          <Text style={{ fontSize: 18, fontWeight: "600", marginVertical: 10 }}>
            {t("dashboard.dailySales")}
          </Text>
          <VictoryChart
            theme={VictoryTheme.material}
            animate={{ duration: 800 }}
          >
            <VictoryAxis
              fixLabelOverlap
              tickFormat={(t: string) => t.slice(5)}
              style={{ tickLabels: { fontSize: 10 } }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(x: number) => `${x} zł`}
              style={{ tickLabels: { fontSize: 10 } }}
            />
            <VictoryLine
              data={dailyData}
              x="date"
              y="total"
              style={{
                data: { stroke: "#2196f3", strokeWidth: 3 },
              }}
            />
          </VictoryChart>
        </>
      )}

      {pieData.length > 0 && (
        <>
          <Text style={{ fontSize: 18, fontWeight: "600", marginVertical: 10 }}>
            {t("dashboard.orderStatusShare")}
          </Text>
          <VictoryPie
            data={pieData}
            colorScale={["#f1c40f", "#2ecc71", "#e74c3c", "#3498db"]}
            labels={({ datum }: any) => `${datum.x}: ${datum.y}%`}
            innerRadius={50}
            labelRadius={80}
            style={{ labels: { fontSize: 14, fill: "#333" } }}
            animate={{ duration: 800 }}
          />
        </>
      )}
    </ScrollView>
  );
}
