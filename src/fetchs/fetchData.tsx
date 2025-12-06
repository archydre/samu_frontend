export interface Accident {
  ocourrenceVertex: number;
  toOcurrencePath: number[];
  toOcurrenceDistance: number;

  hospitalVertex: number;
  toHospitalPath: number[];
  toHospitalDistance: number;

  executionTimeMillis: number;
}

const apiURL = "https://uern-projeto-rotas-samu.onrender.com/api/rota-completa";

export async function fetchOcurrence(): Promise<Accident> {
  try {
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error("It wasn't possible to reach the endpoint");
    }

    const data: Accident = await response.json();
    console.log("data: ", data);
    return data;
  } catch (error) {
    console.error("Falha ao buscar usuários:", error);
    throw error;
  }
}
