import React, { useEffect, useState } from "react";
import { View, Image, ScrollView } from "react-native";
import {
  Text,
  Button,
  TextInput,
  ActivityIndicator,
  Card,
  Snackbar,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");

  const showSnackbar = (message: string) => {
    setSnackbarText(message);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      showSnackbar("Musisz być zalogowany!");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(error);
      showSnackbar("Nie udało się pobrać profilu!");
    } else if (data) {
      setProfile(data);
      setName(data.full_name || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url);
    }

    setLoading(false);
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      await uploadAvatar(file.uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileExt = uri.split(".").pop();
      const fileName = `${Math.random()
        .toString()
        .replace(".", "")}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { contentType: blob.type });

      if (uploadError) {
        console.error(uploadError);
        showSnackbar("Nie udało się przesłać zdjęcia!");
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user) {
        await supabase
          .from("profiles")
          .update({ avatar_url: data.publicUrl })
          .eq("id", user.id);
      }

      showSnackbar("Avatar zaktualizowany!");
    } catch (err) {
      console.error(err);
      showSnackbar("Błąd podczas przesyłania avatara!");
    }
  };

  const saveProfile = async () => {
    if (!profile) {
      showSnackbar("Brak danych profilu!");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        phone,
        address,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      console.error(error);
      showSnackbar("Nie udało się zapisać zmian!");
    } else {
      showSnackbar("Profil zapisany!");
      fetchProfile();
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Wczytywanie profilu...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
        Profil użytkownika
      </Text>

      <Card style={{ alignItems: "center", padding: 20, marginBottom: 16 }}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              marginBottom: 10,
            }}
          />
        ) : (
          <Text>Brak zdjęcia</Text>
        )}
        <Button mode="outlined" onPress={pickAvatar}>
          Zmień avatar
        </Button>
      </Card>

      <TextInput
        label="Imię i nazwisko"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 16 }}
      />

      <TextInput
        label="Telefon"
        value={phone}
        onChangeText={setPhone}
        style={{ marginBottom: 16 }}
      />

      <TextInput
        label="Adres"
        value={address}
        onChangeText={setAddress}
        style={{ marginBottom: 16 }}
      />

      <TextInput
        label="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={3}
        style={{ marginBottom: 16 }}
      />

      <Button mode="contained" onPress={saveProfile}>
        Zapisz zmiany
      </Button>

      <Card style={{ marginTop: 20, padding: 16 }}>
        <Text variant="titleMedium">Podsumowanie profilu:</Text>
        <Text>Imię i nazwisko: {name}</Text>
        <Text>Telefon: {phone || "Brak numeru"}</Text>
        <Text>Adres: {address || "Brak adresu"}</Text>
        <Text>Bio: {bio || "Brak opisu"}</Text>
      </Card>

      <Button
        mode="outlined"
        onPress={async () => {
          await supabase.auth.signOut();
          showSnackbar("Wylogowano!");
          setProfile(null);
          setName("");
          setPhone("");
          setAddress("");
          setBio("");
          setAvatarUrl(null);
        }}
        style={{ marginTop: 20 }}
      >
        Wyloguj się
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: "#4caf50" }}
      >
        {snackbarText}
      </Snackbar>
    </ScrollView>
  );
}
