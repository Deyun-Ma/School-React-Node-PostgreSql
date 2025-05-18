/**
 * Exports data to a CSV file and triggers a download
 * @param data The data to export
 * @param filename The name of the file to download (without extension)
 * @param headers Optional headers for the CSV file
 */
export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  headers?: string[]
): void {
  if (!data || !data.length) {
    console.warn("No data to export");
    return;
  }

  // Determine headers
  const headerRow = headers || Object.keys(data[0]);
  
  // Create CSV content
  const csv = [
    headerRow.join(','), // Header row
    ...data.map(row => {
      return headerRow.map(fieldName => {
        // Handle special types and escape commas and quotes
        const value = row[fieldName];
        
        if (value === null || value === undefined) {
          return '';
        }
        
        if (typeof value === 'object') {
          if (value instanceof Date) {
            return `"${value.toLocaleDateString()}"`;
          }
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        
        if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma or newline
          const escaped = value.replace(/"/g, '""');
          return /[,\n"]/.test(value) ? `"${escaped}"` : escaped;
        }
        
        return value;
      }).join(',');
    })
  ].join('\n');
  
  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Check if browser supports the download attribute
  if (navigator.msSaveBlob) {
    // IE & Edge
    navigator.msSaveBlob(blob, `${filename}.csv`);
  } else {
    // Other browsers
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Exports data to a PDF file
 * Note: This is a simplified version and in a real application would use a library like jsPDF
 */
export function exportToPDF(
  data: Record<string, any>[],
  filename: string
): void {
  console.log("PDF export would go here with data:", data);
  alert("PDF export functionality would require a library like jsPDF");
}

/**
 * Exports data to an Excel file
 * Note: This is a simplified version and in a real application would use a library like xlsx
 */
export function exportToExcel(
  data: Record<string, any>[],
  filename: string
): void {
  console.log("Excel export would go here with data:", data);
  alert("Excel export functionality would require a library like xlsx");
}
