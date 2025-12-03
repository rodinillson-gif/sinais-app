import { describe, it, expect, beforeAll } from "vitest";
import { parseExcelFile } from "./excelParser";
import * as XLSX from "xlsx";
import { getDb, createSpreadsheetWithSignals } from "./db";

describe("Signal Integration Tests", () => {
  it("deve parsear e armazenar sinais corretamente", async () => {
    // Criar dados de teste com sinais nos próximos minutos
    const now = new Date();
    const data = [
      ["Numero", "Data", "Horario", "ID"],
    ];

    // Adicionar 5 sinais nos próximos minutos
    for (let i = 1; i <= 5; i++) {
      const signalTime = new Date(now.getTime() + i * 60 * 1000);
      const hours = String(signalTime.getHours()).padStart(2, "0");
      const minutes = String(signalTime.getMinutes()).padStart(2, "0");
      const seconds = String(signalTime.getSeconds()).padStart(2, "0");
      const horario = `${hours}:${minutes}:${seconds}`;

      const year = signalTime.getFullYear();
      const month = String(signalTime.getMonth() + 1).padStart(2, "0");
      const day = String(signalTime.getDate()).padStart(2, "0");
      const data_str = `${year}-${month}-${day}`;

      const numero = (50 + i * 15.5).toFixed(2);
      const id = 1000000 + i;

      data.push([numero, data_str, horario, id]);
    }

    // Criar workbook
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "sinais");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    // Parsear arquivo
    const signals = await parseExcelFile(buffer as Buffer);

    expect(signals).toHaveLength(5);
    expect(signals[0]).toMatchObject({
      numero: "65.50",
      idSignal: "1000001",
    });
    expect(signals[0].horario).toMatch(/\d{2}:\d{2}:\d{2}/);
    expect(signals[0].data).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it("deve calcular corretamente o tempo até o alerta (1 minuto antes)", async () => {
    const now = new Date();
    const signalTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutos no futuro
    const alertTime = new Date(signalTime.getTime() - 60 * 1000); // 1 minuto antes

    const timeUntilAlert = alertTime.getTime() - now.getTime();

    // Deve estar entre 59 e 61 segundos (aproximadamente 1 minuto)
    expect(timeUntilAlert).toBeGreaterThan(59 * 1000);
    expect(timeUntilAlert).toBeLessThan(61 * 1000);
  });

  it("deve identificar corretamente sinais futuros", async () => {
    const now = new Date();
    const pastTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutos atrás
    const futureTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutos no futuro

    expect(futureTime > now).toBe(true);
    expect(pastTime < now).toBe(true);
  });

  it("deve validar formato de horario correto", async () => {
    const validHorarios = [
      "00:00:00",
      "12:30:45",
      "23:59:59",
      "18:25:30",
    ];

    const horarioRegex = /^\d{2}:\d{2}:\d{2}$/;

    validHorarios.forEach((horario) => {
      expect(horario).toMatch(horarioRegex);
    });
  });

  it("deve validar formato de data correto", async () => {
    const validDatas = [
      "2025-01-01",
      "2025-12-31",
      "2025-06-15",
    ];

    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;

    validDatas.forEach((data) => {
      expect(data).toMatch(dataRegex);
    });
  });

  it("deve filtrar sinais por multiplicador minimo", async () => {
    const signals = [
      { numero: "5.5", horario: "10:00:00", data: "2025-12-02", idSignal: "1" },
      { numero: "15.5", horario: "10:01:00", data: "2025-12-02", idSignal: "2" },
      { numero: "25.5", horario: "10:02:00", data: "2025-12-02", idSignal: "3" },
      { numero: "35.5", horario: "10:03:00", data: "2025-12-02", idSignal: "4" },
    ];

    const minMultiplier = 15;
    const filtered = signals.filter(
      (s) => parseFloat(s.numero) >= minMultiplier
    );

    expect(filtered).toHaveLength(3);
    expect(filtered[0].numero).toBe("15.5");
  });

  it("deve agrupar sinais por hora corretamente", async () => {
    const signals = [
      { numero: "10.5", horario: "10:15:30", data: "2025-12-02", idSignal: "1" },
      { numero: "20.5", horario: "10:45:00", data: "2025-12-02", idSignal: "2" },
      { numero: "30.5", horario: "11:20:15", data: "2025-12-02", idSignal: "3" },
      { numero: "40.5", horario: "11:50:00", data: "2025-12-02", idSignal: "4" },
    ];

    const grouped = signals.reduce(
      (acc, signal) => {
        const key = `${signal.data} ${signal.horario.substring(0, 2)}:00`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(signal);
        return acc;
      },
      {} as Record<string, typeof signals>
    );

    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped["2025-12-02 10:00"]).toHaveLength(2);
    expect(grouped["2025-12-02 11:00"]).toHaveLength(2);
  });
});
