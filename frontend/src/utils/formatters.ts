export function formatCurrency(
  value: number | undefined | null,
  currency: string = "BRL",
  locale: string = "pt-BR",
): string {
  if (value === undefined || value === null || isNaN(value)) return "-";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatFxRate(
  rate: number | undefined | null,
  locale: string = "pt-BR",
): string {
  if (rate === undefined || rate === null || isNaN(rate)) return "-";

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(rate);
}

export function formatPercent(
  value: number | undefined | null,
  decimals: number = 1,
): string {
  if (value === undefined || value === null || isNaN(value)) return "0%";

  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
