import i18n from "../i18n";
import React from "react";
import { Icon } from "react-native-paper";
import { supabase } from "./supabase";

export function formatPrice(value: number): string {
  const lang = i18n.language || "pl";

  if (lang === "pl") {
    return `${value.toLocaleString("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} zł`;
  } else {
    return `PLN ${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

export function formatDate(date: string | Date): string {
  const lang = i18n.language || "pl";
  return new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function shortId(id: string): string {
  return id.slice(0, 6).toUpperCase();
}

export const validateRequired = (value: string, minLength = 1): boolean => {
  return value.trim().length >= minLength;
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  return /^\+?\d{9,15}$/.test(phone.trim());
};

export const validatePassword = (password: string): boolean => {
  const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
  return regex.test(password);
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword;
};

export function filterProducts(products: any[], query: string) {
  if (!query.trim()) return products;
  const lower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description?.toLowerCase().includes(lower)
  );
}

export function calculateAverageRatings(reviews: any[]): {
  averages: Record<number, number>;
  counts: Record<number, number>;
} {
  const sums: Record<number, number> = {};
  const counts: Record<number, number> = {};

  reviews.forEach((r) => {
    const id = Number(r.product_id);
    sums[id] = (sums[id] || 0) + r.rating;
    counts[id] = (counts[id] || 0) + 1;
  });

  const averages: Record<number, number> = {};
  Object.keys(sums).forEach((idStr) => {
    const id = Number(idStr);
    averages[id] = sums[id] / counts[id];
  });

  return { averages, counts };
}

export function mapAverageRatings(
  reviews: any[]
): Record<number, { avg: number; count: number }> {
  const { averages, counts } = calculateAverageRatings(reviews);
  const result: Record<number, { avg: number; count: number }> = {};
  Object.keys(averages).forEach((idStr) => {
    const id = Number(idStr);
    result[id] = { avg: averages[id], count: counts[id] };
  });
  return result;
}

export function renderStars(rating: number) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <Icon
          key={i}
          source={i < Math.round(rating) ? "star" : "star-outline"}
          color={i < Math.round(rating) ? "#FFD700" : "#ccc"}
          size={18}
        />
      ))}
    </>
  );
}

export function formatStarsLabel(rating: number, count: number): string {
  const lang = i18n.language || "pl";

  if (count === 0) {
    return lang === "pl" ? "Brak ocen" : "No reviews yet";
  }

  if (lang === "pl") {
    const opinie = count === 1 ? "opinia" : count < 5 ? "opinie" : "opinii";
    return `${rating.toFixed(1)} (${count} ${opinie})`;
  } else {
    const reviews = count === 1 ? "review" : "reviews";
    return `${rating.toFixed(1)} (${count} ${reviews})`;
  }
}

export async function getAverageProductRating(
  productId: number
): Promise<{ avg: number; count: number }> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error) {
    console.error("Błąd pobierania ocen produktu:", error);
    return { avg: 0, count: 0 };
  }

  if (!data || data.length === 0) {
    return { avg: 0, count: 0 };
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  const avg = sum / data.length;

  return { avg, count: data.length };
}
