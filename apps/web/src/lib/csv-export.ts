export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const stringVal = String(cell ?? "");
          return `"${stringVal.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
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
