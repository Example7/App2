import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { supabase } from "../../lib";
import {
  ActivityIndicator,
  TextInput,
  Button,
  Card,
  Icon,
} from "react-native-paper";
import { useAuthStore } from "../../store/useAuthStore";
import { useTranslation } from "react-i18next";
import { renderStars, formatDate } from "../../lib";
import * as Sentry from "sentry-expo";

export default function ProductReviews({ productId }: { productId: number }) {
  const { t } = useTranslation();
  const { session } = useAuthStore();

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles(full_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (!error && data) setReviews(data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!session?.user) {
      alert(t("reviews.mustLogin"));
      return;
    }

    if (rating < 1 || rating > 5) {
      alert(t("reviews.invalidRating"));
      return;
    }

    setSubmitting(true);

    const newReview = {
      id: crypto.randomUUID(),
      user_id: session.user.id,
      product_id: productId,
      rating,
      comment,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: session.user.user_metadata?.full_name || t("reviews.you"),
      },
    };

    const { error } = await supabase.from("reviews").insert([
      {
        user_id: session.user.id,
        product_id: productId,
        rating,
        comment,
      },
    ]);

    if (error) {
      Sentry.Native.captureException(error);
      alert(t("reviews.error"));
    } else {
      setReviews((prev) => [newReview, ...prev]);
      setComment("");
      setRating(0);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={{ alignItems: "center", padding: 20 }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>{t("reviews.loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        {t("reviews.title")}
      </Text>

      {reviews.length === 0 ? (
        <Text style={{ color: "#777", fontStyle: "italic" }}>
          {t("reviews.noReviews")}
        </Text>
      ) : (
        reviews.map((r) => (
          <Card
            key={r.id}
            style={{
              marginBottom: 10,
              padding: 10,
              backgroundColor: "#fff",
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              {r.profiles?.full_name || t("reviews.anonymous")}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              {renderStars(r.rating)}
              <Text style={{ marginLeft: 6, color: "#555" }}>
                ({r.rating}/5)
              </Text>
            </View>

            {r.comment && (
              <Text style={{ marginTop: 4, color: "#333" }}>{r.comment}</Text>
            )}
            <Text style={{ color: "#888", marginTop: 6, fontSize: 12 }}>
              {formatDate(r.created_at)}
            </Text>
          </Card>
        ))
      )}

      {session && (
        <View style={{ marginTop: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            {t("reviews.addReview")}
          </Text>

          <View
            style={{
              flexDirection: "row",
              marginVertical: 10,
              justifyContent: "flex-start",
            }}
          >
            {[...Array(5)].map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setRating(i + 1)}
                activeOpacity={0.6}
              >
                <Icon
                  source={i < rating ? "star" : "star-outline"}
                  color={i < rating ? "#FFD700" : "#ccc"}
                  size={28}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            label={t("reviews.commentLabel")}
            value={comment}
            onChangeText={setComment}
            multiline
            style={{ marginBottom: 8 }}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
          >
            {t("reviews.submit")}
          </Button>
        </View>
      )}
    </ScrollView>
  );
}
