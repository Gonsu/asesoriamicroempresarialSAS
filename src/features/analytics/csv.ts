export type CsvCell = string | number;

// Excel en español usa ";" como separador de lista; el BOM hace que lea el archivo como UTF-8.
const SEPARATOR = ";";
const BOM = "﻿";

function formatCell(value: CsvCell): string {
  if (typeof value === "number") return String(value);
  // Evita que Excel interprete un texto como fórmula (inyección CSV).
  const text = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: CsvCell[][]): string {
  return BOM + rows.map((row) => row.map(formatCell).join(SEPARATOR)).join("\r\n") + "\r\n";
}

export function downloadCsv(filename: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
