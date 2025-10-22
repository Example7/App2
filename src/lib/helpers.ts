import i18n from "../i18n";

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
