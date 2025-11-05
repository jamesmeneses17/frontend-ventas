// utils/formatters.ts
export const formatCurrency = (value: number): string => {
  return `$${new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;
};
