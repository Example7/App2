import React, { useState } from "react";
import { View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Snackbar,
  ActivityIndicator,
} from "react-native-paper";
import { supabase, validateRequired, validateEmail } from "../../lib";
import { LoadingView } from "../../components";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");

  const showSnackbar = (msg: string) => {
    setSnackbarText(msg);
    setSnackbarVisible(true);
  };

  const handleLogin = async () => {
    if (!validateRequired(email) || !validateRequired(password)) {
      showSnackbar("Podaj adres e-mail i hasło!");
      return;
    }

    if (!validateEmail(email)) {
      showSnackbar("Niepoprawny adres e-mail!");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      showSnackbar("Niepoprawne dane logowania!");
    } else {
      showSnackbar("Zalogowano pomyślnie!");
    }
  };

  if (loading) return <LoadingView message="Wczytywanie..." />;

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 20 }}>
        Logowanie
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
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
      >
        Zaloguj się
      </Button>

      <Button onPress={() => navigation.navigate("Register")}>
        Nie masz konta? Zarejestruj się
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
