import React, { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, Snackbar } from "react-native-paper";
import {
  supabase,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "../../lib";
import { LoadingView } from "../../components";

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!validateEmail(email)) {
      showSnackbar("Niepoprawny adres e-mail!");
      return;
    }

    if (!validatePassword(password)) {
      showSnackbar("Hasło musi mieć min. 6 znaków, dużą literę i cyfrę!");
      return;
    }

    if (!validateConfirmPassword(password, confirmPassword)) {
      showSnackbar("Hasła muszą być identyczne!");
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

  if (loading) return <LoadingView message="Wczytywanie..." />;

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
      <TextInput
        label="Potwierdź hasło"
        mode="outlined"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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
