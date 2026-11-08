const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

function sanitizeCsvCell(cell: string | number | null | undefined): string {
  let stringVal = String(cell ?? "");
  const trimmed = stringVal.trimStart();
  if (FORMULA_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    stringVal = `'${stringVal}`;
  }
  return `"${stringVal.replace(/"/g, '""')}"`;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const csvRows = [
    headers.join(","),
    ...rows.map((row) => row.map(sanitizeCsvCell).join(",")),
  ];

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
