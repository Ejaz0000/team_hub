export function downloadCsv(filename, rows) {
  if (!rows || rows.length === 0) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const escapeValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((key) => escapeValue(row[key])).join(","));
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
