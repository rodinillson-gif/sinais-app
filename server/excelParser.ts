import * as XLSX from "xlsx";

/**
 * Remove accents from string for comparison
 */
function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Parse Excel file buffer and extract signal data
 * Expected columns: Numero, Data, Horario, ID (or with accents: Número, Horário)
 */
export interface SignalData {
  numero: string;
  data: string;
  horario: string;
  idSignal: string;
}

export async function parseExcelFile(fileBuffer: Buffer): Promise<SignalData[]> {
  try {
    // Read the workbook from buffer
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("No sheets found in Excel file");
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with headers
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Get raw arrays
    }) as Array<any[]>;

    if (data.length < 2) {
      throw new Error("Excel file must have headers and at least one data row");
    }

    // Extract headers (first row)
    const headers = data[0];
    const numeroIndex = headers.findIndex((h) => removeAccents(h?.toString().toLowerCase()) === "numero");
    const dataIndex = headers.findIndex((h) => removeAccents(h?.toString().toLowerCase()) === "data");
    const horarioIndex = headers.findIndex((h) => removeAccents(h?.toString().toLowerCase()) === "horario");
    const idIndex = headers.findIndex((h) => removeAccents(h?.toString().toLowerCase()) === "id");

    if (numeroIndex === -1 || dataIndex === -1 || horarioIndex === -1 || idIndex === -1) {
      throw new Error(
        "Excel file must have columns: Numero, Data, Horario, ID"
      );
    }

    // Extract signal data from rows
    const signals: SignalData[] = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Skip empty rows
      if (!row || row.length === 0) continue;

      const numero = row[numeroIndex];
      const dataValue = row[dataIndex];
      const horario = row[horarioIndex]?.toString().trim();
      const id = row[idIndex]?.toString().trim();

      // Skip rows with missing values
      if (!numero || !dataValue || !horario || !id) continue;

      // Format numero (handle both string and number)
      const numeroStr = typeof numero === 'number' ? numero.toFixed(2) : numero.toString().trim();
      
      // Format date (handle Date objects and strings)
      let formattedDate: string;
      if (dataValue instanceof Date) {
        // Date object from Excel
        formattedDate = dataValue.toISOString().split("T")[0];
      } else if (typeof dataValue === 'number') {
        // Excel date serial number
        const excelDate = new Date((dataValue - 25569) * 86400 * 1000);
        formattedDate = excelDate.toISOString().split("T")[0];
      } else {
        // Already a string
        formattedDate = dataValue.toString().trim();
      }

      signals.push({
        numero: numeroStr,
        data: formattedDate,
        horario,
        idSignal: id,
      });
    }

    if (signals.length === 0) {
      throw new Error("No valid signal data found in Excel file");
    }

    return signals;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`);
  }
}
