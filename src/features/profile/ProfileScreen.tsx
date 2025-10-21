import i18n from "../../i18n";
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
import { useTranslation } from "react-i18next";

export default function ProfileScreen() {
  const { t } = useTranslation();
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
      snackbar.show(
        t("profile.loginRequired", { defaultValue: "You must be logged in!" }),
        3000,
        "#e74c3c"
      );
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
      snackbar.show(t("profile.fetchError"), 3000, "#e74c3c");
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
        snackbar.show(t("profile.avatarError"), 3000, "#e74c3c");
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

      snackbar.show(t("profile.avatarUpdate"));
    } catch (err) {
      console.error(err);
      snackbar.show(t("profile.avatarError"), 3000, "#e74c3c");
    }
  };

  const saveProfile = async () => {
    if (!profile) {
      snackbar.show(t("profile.noProfile"), 3000, "#e74c3c");
      return;
    }

    if (!validateRequired(name)) {
      snackbar.show(t("profile.invalidName"), 3000, "#e74c3c");
      return;
    }

    if (phone && !validatePhone(phone)) {
      snackbar.show(t("profile.invalidPhone"), 3000, "#e74c3c");
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
      snackbar.show(t("profile.saveError"), 3000, "#e74c3c");
    } else {
      snackbar.show(t("profile.updated"));
      fetchProfile();
    }
  };

  if (loading)
    return (
      <LoadingView
        message={t("profile.loading", { defaultValue: "Loading profile..." })}
      />
    );

  return (
    <ScrollView
      style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 6, marginTop: 18 }}
      >
        {t("profile.title")}
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
          <Text>{t("home.noImage")}</Text>
        )}
        <Button mode="outlined" onPress={pickAvatar}>
          {t("profile.changeAvatar", { defaultValue: "Change avatar" })}
        </Button>
      </Card>

      <TextInput
        label={t("profile.name")}
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 16 }}
      />
      <TextInput
        label={t("profile.phone")}
        value={phone}
        onChangeText={setPhone}
        style={{ marginBottom: 16 }}
      />
      <TextInput
        label={t("profile.address")}
        value={address}
        onChangeText={setAddress}
        style={{ marginBottom: 16 }}
      />
      <TextInput
        label={t("profile.bio")}
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={3}
        style={{ marginBottom: 16 }}
      />

      <Button onPress={() => i18n.changeLanguage("en")}>English</Button>
      <Button onPress={() => i18n.changeLanguage("pl")}>Polski</Button>

      <Button mode="contained" onPress={saveProfile}>
        {t("profile.save")}
      </Button>

      <Card style={{ marginTop: 20, padding: 16 }}>
        <Text variant="titleMedium">
          {t("profile.summary", { defaultValue: "Profile summary:" })}
        </Text>
        <Text>
          {t("profile.lastUpdate")}:{" "}
          {formatDate(profile?.updated_at || new Date())}
        </Text>
        <Text>
          {t("profile.name")}: {name}
        </Text>
        <Text>
          {t("profile.phone")}:{" "}
          {phone || t("profile.noPhone", { defaultValue: "No phone number" })}
        </Text>
        <Text>
          {t("profile.address")}:{" "}
          {address || t("profile.noAddress", { defaultValue: "No address" })}
        </Text>
        <Text>
          {t("profile.bio")}:{" "}
          {bio || t("profile.noBio", { defaultValue: "No bio" })}
        </Text>
      </Card>

      <Button
        mode="outlined"
        onPress={async () => {
          await supabase.auth.signOut();
          snackbar.show(t("profile.logoutSuccess"));
          setProfile(null);
          setName("");
          setPhone("");
          setAddress("");
          setBio("");
          setAvatarUrl(null);
        }}
        style={{ marginTop: 20 }}
      >
        {t("profile.logout")}
      </Button>
    </ScrollView>
  );
}
