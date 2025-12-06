import fs from "fs";
import { COORDS, connections } from "./dots.js";

// 2. FUNÇÃO DE CÁLCULO DE DISTÂNCIA (Fórmula de Haversine)
function getLeafletStyleDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Raio da Terra em metros
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d);
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// 3. LÓGICA DE GERAÇÃO DA MATRIZ
const numNodes = COORDS.length;

// Inicializa matriz 115x115 com 9999 (infinito)
let matrix = Array(numNodes)
  .fill()
  .map(() => Array(numNodes).fill(9999));

// Preenche a diagonal com 0
for (let i = 0; i < numNodes; i++) {
  matrix[i][i] = 0;
}

// Preenche as distâncias baseadas nas conexões
for (let i = 0; i < numNodes; i++) {
  const neighbors = connections[i];

  neighbors.forEach((neighborID) => {
    // neighborID é 1-based, array é 0-based
    const targetIndex = neighborID - 1;

    const dist = getLeafletStyleDistance(
      COORDS[i][0],
      COORDS[i][1],
      COORDS[targetIndex][0],
      COORDS[targetIndex][1]
    );

    matrix[i][targetIndex] = dist;
  });
}

// 4. GERAÇÃO DO ARQUIVO TXT
let fileContent = `${numNodes}\n`;

matrix.forEach((row) => {
  fileContent += row.join("\t") + "\n";
});

fileContent += "-1";

fs.writeFileSync("DistSAMU_115.txt", fileContent);

console.log("Arquivo DistSAMU_115.txt gerado com sucesso!");
