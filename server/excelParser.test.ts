import { describe, it, expect } from "vitest";
import { parseExcelFile } from "./excelParser";
import * as XLSX from "xlsx";

describe("excelParser", () => {
  it("deve parsear um arquivo Excel com dados validos", async () => {
    // Criar um workbook de teste
    const data = [
      ["Numero", "Data", "Horario", "ID"],
      [4.07, "2025-12-02", "23:59:49", 1783157],
      [178.13, "2025-12-02", "23:59:21", 1783156],
      [1.58, "2025-12-02", "23:58:03", 1783155],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "data");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    const result = await parseExcelFile(buffer as Buffer);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      numero: "4.07",
      data: "2025-12-02",
      horario: "23:59:49",
      idSignal: "1783157",
    });
    expect(result[1]).toEqual({
      numero: "178.13",
      data: "2025-12-02",
      horario: "23:59:21",
      idSignal: "1783156",
    });
  });

  it("deve lancar erro se nao houver colunas necessarias", async () => {
    // Criar um workbook sem as colunas necessarias
    const data = [
      ["Coluna1", "Coluna2"],
      ["valor1", "valor2"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "data");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    await expect(parseExcelFile(buffer as Buffer)).rejects.toThrow(
      "Excel file must have columns: Numero, Data, Horario, ID"
    );
  });

  it("deve lancar erro se o arquivo nao tiver dados", async () => {
    // Criar um workbook vazio
    const worksheet = XLSX.utils.aoa_to_sheet([["Numero", "Data", "Horario", "ID"]]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "data");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    await expect(parseExcelFile(buffer as Buffer)).rejects.toThrow(
      "Excel file must have headers and at least one data row"
    );
  });

  it("deve ignorar linhas com valores ausentes", async () => {
    // Criar um workbook com linhas incompletas
    const data = [
      ["Numero", "Data", "Horario", "ID"],
      [4.07, "2025-12-02", "23:59:49", 1783157],
      ["", "2025-12-02", "23:59:21", 1783156],
      [1.58, "2025-12-02", "23:58:03", 1783155],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "data");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    const result = await parseExcelFile(buffer as Buffer);

    expect(result).toHaveLength(2);
    expect(result[0].numero).toBe("4.07");
    expect(result[1].numero).toBe("1.58");
  });
});
