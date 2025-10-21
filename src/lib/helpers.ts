export function formatPrice(value: number): string {
  return `${value.toFixed(2)} zł`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString("pl-PL");
}

export function shortId(id: string): string {
  return id.slice(0, 6).toUpperCase();
}
