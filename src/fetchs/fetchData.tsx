export interface Accident {
  ocurrenceVertex: number;
  toOcurrencePath: number[];
  toOcurrenceDistance: number;

  hospitalVertex: number;
  toHospitalPath: number[];
  toHospitalDistance: number;

  executionTimeMillis: number;
}

const apiURL = "https://uern-projeto-rotas-samu.onrender.com/api/rota-completa";
const vertexApiURL =
  "https://uern-projeto-rotas-samu.onrender.com/api/calcular-rota-completa";

export async function fetchOcurrence(): Promise<Accident> {
  try {
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error("It wasn't possible to reach the endpoint");
    }

    const data: Accident = await response.json();
    console.log("ocurrenceDetails: ", data);
    return data;
  } catch (error) {
    console.error("Falha ao buscar usuários:", error);
    throw error;
  }
}

export async function fetchOcurrenceByVertex(
  vertex: number
): Promise<Accident> {
  try {
    const response = await fetch(vertexApiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ocurrence: vertex,
      }),
    });

    if (!response.ok) {
      throw Error("it wasn't possible to reach endpoint");
    }

    const data = await response.json();
    console.log("data: ", data);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
