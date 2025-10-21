import React, { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { supabase, validateRequired, validateEmail } from "../../lib";
import { LoadingView } from "../../components";
import { useSnackbar } from "../../hooks/useSnackbar";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const snackbar = useSnackbar();

  const handleLogin = async () => {
    if (!validateRequired(email) || !validateRequired(password)) {
      snackbar.show("Podaj adres e-mail i hasło!", 3000, "#e74c3c");
      return;
    }

    if (!validateEmail(email)) {
      snackbar.show("Niepoprawny adres e-mail!", 3000, "#e74c3c");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      snackbar.show("Niepoprawne dane logowania!", 3000, "#e74c3c");
    } else {
      snackbar.show("Zalogowano pomyślnie!");
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
    </View>
  );
}
