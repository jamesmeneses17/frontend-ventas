// utils/formatters.ts
export const formatCurrency = (value: number, currencyLabel = 'COP'): string => {
  // Usa separador de miles con coma (en-US) para mostrar 700,000
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return `${currencyLabel} ${formatted}`;
};

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(value);
