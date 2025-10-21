import React from "react";
import { ScrollView, View } from "react-native";
import { Text, Button, Card, Divider } from "react-native-paper";
import { useCartStore } from "../../store/useCartStore";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/helpers";
import { EmptyState } from "../../components";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useTranslation } from "react-i18next";

export default function CartScreen() {
  const { items, removeFromCart, clearCart, getTotal, getCount } =
    useCartStore();
  const total = getTotal();
  const count = getCount();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const placeOrder = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      snackbar.show(t("orders.loginRequired"), 3000, "#e74c3c");
      return;
    }

    if (items.length === 0) {
      snackbar.show(t("orders.empty"), 3000, "#e74c3c");
      return;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          total: getTotal(),
          status: t("orders.inProgress"),
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error(orderError);
      snackbar.show(t("orders.createError"), 3000, "#e74c3c");
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
      snackbar.show(t("orders.itemsError"), 3000, "#e74c3c");
      return;
    }

    clearCart();
    snackbar.show(t("orders.success"));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      {count === 0 ? (
        <EmptyState icon="cart-outline" message={t("cart.empty")} />
      ) : (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text
            variant="headlineSmall"
            style={{ fontWeight: "700", marginBottom: 6, marginTop: 18 }}
          >
            {t("cart.title")} ({count})
          </Text>

          {items.map((item) => (
            <Card key={item.id} style={{ marginBottom: 12, borderRadius: 12 }}>
              <Card.Title
                title={item.name}
                subtitle={`${item.quantity} ${t("cart.pieces")}`}
              />
              <Card.Content>
                <Text>{formatPrice(item.price * item.quantity)}</Text>
              </Card.Content>
              <Card.Actions>
                <Button
                  textColor="#e74c3c"
                  onPress={() => removeFromCart(item.id)}
                >
                  {t("cart.remove")}
                </Button>
              </Card.Actions>
            </Card>
          ))}

          <Divider style={{ marginVertical: 12 }} />

          <Text style={{ textAlign: "right", fontWeight: "700", fontSize: 18 }}>
            {t("cart.total")}: {formatPrice(total)}
          </Text>

          <Button
            mode="contained"
            style={{ marginTop: 20, backgroundColor: "#4caf50" }}
            onPress={placeOrder}
          >
            {t("cart.placeOrder")}
          </Button>

          <Button
            mode="outlined"
            textColor="#333"
            style={{ marginTop: 10 }}
            onPress={clearCart}
          >
            {t("cart.clear")}
          </Button>
        </ScrollView>
      )}
    </View>
  );
}
