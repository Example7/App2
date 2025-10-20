import React, { useState } from "react";
import { View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Snackbar,
  ActivityIndicator,
} from "react-native-paper";
import { supabase } from "../../lib/supabase";

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");

  const showSnackbar = (msg: string) => {
    setSnackbarText(msg);
    setSnackbarVisible(true);
  };

  const handleRegister = async () => {
    if (!email || !password) {
      showSnackbar("Podaj adres email i hasło!");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      showSnackbar(error.message);
    } else if (data?.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          full_name: "",
          avatar_url: null,
          created_at: new Date().toISOString(),
        },
      ]);

      showSnackbar("Rejestracja zakończona! Możesz się zalogować.");
      setTimeout(() => navigation.goBack(), 1500);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Rejestrowanie...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 20 }}>
        Rejestracja
      </Text>

      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Hasło"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 20 }}
      />

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
      >
        Zarejestruj się
      </Button>

      <Button onPress={() => navigation.goBack()}>
        Masz już konto? Zaloguj się
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: "#4caf50" }}
      >
        {snackbarText}
      </Snackbar>
    </View>
  );
}
