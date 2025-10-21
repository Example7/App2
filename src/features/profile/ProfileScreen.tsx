import React, { useEffect, useState } from "react";
import { Image, ScrollView } from "react-native";
import { Text, Button, TextInput, Card } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import {
  supabase,
  formatDate,
  validateRequired,
  validatePhone,
} from "../../lib";
import { Profile } from "../../types";
import { LoadingView } from "../../components";
import { useSnackbar } from "../../hooks/useSnackbar";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const snackbar = useSnackbar();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      snackbar.show("Musisz być zalogowany!", 3000, "#e74c3c");
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
      snackbar.show("Nie udało się pobrać profilu!", 3000, "#e74c3c");
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
        snackbar.show("Nie udało się przesłać zdjęcia!", 3000, "#e74c3c");
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

      snackbar.show("Avatar zaktualizowany!");
    } catch (err) {
      console.error(err);
      snackbar.show("Błąd podczas przesyłania avatara!", 3000, "#e74c3c");
    }
  };

  const saveProfile = async () => {
    if (!profile) {
      snackbar.show("Brak danych profilu!", 3000, "#e74c3c");
      return;
    }

    if (!validateRequired(name)) {
      snackbar.show("Imię i nazwisko nie może być puste!", 3000, "#e74c3c");
      return;
    }

    if (phone && !validatePhone(phone)) {
      snackbar.show("Numer telefonu jest niepoprawny!", 3000, "#e74c3c");
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
      snackbar.show("Nie udało się zapisać zmian!", 3000, "#e74c3c");
    } else {
      snackbar.show("Profil zapisany!");
      fetchProfile();
    }
  };

  if (loading) return <LoadingView message="Wczytywanie profilu..." />;

  return (
    <ScrollView
      style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 6, marginTop: 18 }}
      >
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
        <Text>
          Ostatnia aktualizacja: {formatDate(profile?.updated_at || new Date())}
        </Text>
        <Text>Imię i nazwisko: {name}</Text>
        <Text>Telefon: {phone || "Brak numeru"}</Text>
        <Text>Adres: {address || "Brak adresu"}</Text>
        <Text>Bio: {bio || "Brak opisu"}</Text>
      </Card>

      <Button
        mode="outlined"
        onPress={async () => {
          await supabase.auth.signOut();
          snackbar.show("Wylogowano!");
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
    </ScrollView>
  );
}
