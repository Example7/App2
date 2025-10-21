export function formatPrice(value: number): string {
  return `${value.toFixed(2)} zł`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString("pl-PL");
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
