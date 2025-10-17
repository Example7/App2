import React from "react";
import { View } from "react-native";
import { Text, Button, Card } from "react-native-paper";

export default function ProductDetailsScreen({ route, navigation }: any) {
  const { product } = route.params;

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <Card>
        <Card.Title title={product.name} />
        <Card.Content>
          <Text variant="titleLarge" style={{ marginBottom: 10 }}>
            Cena: {product.price} zł
          </Text>
          <Text style={{ color: "#666" }}>
            Tutaj możesz dodać opis produktu lub inne szczegóły.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => alert("Dodano do koszyka!")}>
            Dodaj do koszyka
          </Button>
        </Card.Actions>
      </Card>

      <Button style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>
        Wróć
      </Button>
    </View>
  );
}
