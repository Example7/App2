import React, { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import {
  supabase,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "../../lib";
import { LoadingView } from "../../components";
import { useSnackbar } from "../../hooks/useSnackbar";

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const snackbar = useSnackbar();

  const handleRegister = async () => {
    if (!email || !password) {
      snackbar.show("Podaj adres email i hasło!", 3000, "#e74c3c");
      return;
    }

    if (!validateEmail(email)) {
      snackbar.show("Niepoprawny adres e-mail!", 3000, "#e74c3c");
      return;
    }

    if (!validatePassword(password)) {
      snackbar.show(
        "Hasło musi mieć min. 6 znaków, dużą literę i cyfrę!",
        3000,
        "#e74c3c"
      );
      return;
    }

    if (!validateConfirmPassword(password, confirmPassword)) {
      snackbar.show("Hasła muszą być identyczne!", 3000, "#e74c3c");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      snackbar.show(error.message, 3000, "#e74c3c");
    } else if (data?.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          full_name: "",
          avatar_url: null,
          created_at: new Date().toISOString(),
        },
      ]);

      snackbar.show("Rejestracja zakończona! Możesz się zalogować.");
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
    </View>
  );
}
