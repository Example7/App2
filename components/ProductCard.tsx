import React, { useState } from "react";
import { Card, Text, Button, Portal, Dialog } from "react-native-paper";
import { useCartStore } from "../store/useCartStore";

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCartStore();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Card style={{ marginBottom: 12 }} onPress={() => setVisible(true)}>
        <Card.Title title={product.name} />
        <Card.Content>
          <Text>Cena: {product.price} zł</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => addToCart(product)}>
            Dodaj do koszyka
          </Button>
        </Card.Actions>
      </Card>

      {/* Szczegóły produktu w Dialogu */}
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>{product.name}</Dialog.Title>
          <Dialog.Content>
            <Text>Cena: {product.price} zł</Text>
            <Text>ID produktu: {product.id}</Text>
            <Text>Opis produktu może się tu pojawić...</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Zamknij</Button>
            <Button mode="contained" onPress={() => addToCart(product)}>
              Dodaj do koszyka
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
