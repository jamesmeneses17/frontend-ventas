// utils/formatters.ts
export const formatCurrency = (value: number, currencyLabel = '$'): string => {
  // Usa separador de miles con punto y decimales con coma (es-CO)
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${currencyLabel} ${formatted}`;
};

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(value);

export const formatCOP = (value: number): string =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value);

export const formatDate = (value?: string | Date | null): string => {
  if (!value) return "-";
  try {
    // Si es una cadena YYYY-MM-DD, la tratamos como fecha local para evitar desfase de zona horaria
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day).toLocaleDateString('es-CO');
    }

    const d = typeof value === 'string' ? new Date(value) : value;
    return d.toLocaleDateString('es-CO');
  } catch (e) {
    return String(value);
  }
};
