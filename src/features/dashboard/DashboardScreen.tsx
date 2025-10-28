import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { supabase } from "../../lib";
import { useAuthStore } from "../../store/useAuthStore";
import { useTranslation } from "react-i18next";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const { t } = useTranslation();
  const [barData, setBarData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const { role } = useAuthStore();

  useEffect(() => {
    if (role === "admin") fetchStats();
  }, [role]);

  const fetchStats = async () => {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("status, total, created_at");

    if (error || !orders) return;

    const grouped = orders.reduce((acc: any, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + Number(o.total);
      return acc;
    }, {});
    setBarData(Object.entries(grouped));

    const daily = orders.reduce((acc: any, o: any) => {
      const date = o.created_at.split("T")[0];
      acc[date] = (acc[date] || 0) + Number(o.total);
      return acc;
    }, {});
    setLineData(Object.entries(daily));

    const totalSum = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const pie = Object.entries(grouped).map(([status, total]) => ({
      name: status,
      population: Math.round((Number(total) / totalSum) * 100),
      color:
        status === "completed"
          ? "#2ecc71"
          : status === "pending"
          ? "#f1c40f"
          : "#e74c3c",
      legendFontColor: "#333",
      legendFontSize: 12,
    }));
    setPieData(pie);
  };

  if (role !== "admin") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9f9f9",
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f9f9f9" }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        {t("dashboard.title")}
      </Text>

      {barData.length > 0 && (
        <>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
            {t("dashboard.ordersByStatus")}
          </Text>
          <BarChart
            data={{
              labels: barData.map(([status]) => status),
              datasets: [{ data: barData.map(([, total]) => Number(total)) }],
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" zł"
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: () => "#333",
              barPercentage: 0.6,
            }}
            style={{ borderRadius: 12, marginVertical: 8 }}
          />
        </>
      )}

      {lineData.length > 0 && (
        <>
          <Text style={{ fontSize: 18, fontWeight: "600", marginVertical: 10 }}>
            {t("dashboard.dailySales")}
          </Text>
          <LineChart
            data={{
              labels: lineData.map(([date]) => date.slice(5)),
              datasets: [{ data: lineData.map(([, total]) => Number(total)) }],
            }}
            width={screenWidth - 40}
            height={220}
            yAxisSuffix=" zł"
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: () => "#333",
            }}
            style={{ borderRadius: 12 }}
          />
        </>
      )}

      {pieData.length > 0 && (
        <>
          <Text style={{ fontSize: 18, fontWeight: "600", marginVertical: 10 }}>
            {t("dashboard.orderStatusShare")}
          </Text>
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 0]}
            absolute
          />
        </>
      )}
    </ScrollView>
  );
}
