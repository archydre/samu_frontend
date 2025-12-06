import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import type { LatLngTuple } from "leaflet";
import Map from "./components/Map";
import { fetchOcurrence, type Accident } from "./fetchs/fetchData";
import COORDS from "../dots.json";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const [accident, setAccident] = useState<Accident | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [path, setPath] = useState<LatLngTuple[]>();
  const [nearestHospital, setNearestHospital] = useState<LatLngTuple>();
  const [ocurrenceVertex, setOcurrenceVertex] = useState<LatLngTuple>();

  // ...
  const vertexToCoordPath = (
    vertexPath: number[],
    coordsArray: LatLngTuple[]
  ): LatLngTuple[] => {
    return (
      vertexPath
        .map((vertexIndex) => coordsArray[vertexIndex])
        // O filtro resolve o problema do índice ser undefined (ou out-of-bounds)
        .filter(
          (coord): coord is LatLngTuple => coord !== undefined && coord !== null
        )
    );
  };
  // ...

  const handleButtonClick = () => {
    setLoading(true);

    fetchOcurrence().then((data: Accident) => {
      setAccident(data);
      setNearestHospital(COORDS[data.hospitalVertex] as LatLngTuple);

      // CORREÇÃO ESSENCIAL: Verificação defensiva para a coordenada de ocorrência
      const occurrenceCoord = COORDS[data.ocourrenceVertex];
      console.log("ocorreu em ", occurrenceCoord);
      setOcurrenceVertex(
        occurrenceCoord ? (occurrenceCoord as LatLngTuple) : undefined
      );

      // CORREÇÃO: Usar arrays vazios como fallback se os dados vierem como undefined/null
      const safeOcurrencePath = data.toOcurrencePath || [];
      const safeToHospitalPath = data.toHospitalPath || [];

      // Remove o vértice de ocorrência duplicado, que é o primeiro em toHospitalPath
      const pathFromOcurrenceToHospital = safeToHospitalPath.slice(1);

      const vertexIndices = [
        ...safeOcurrencePath,
        ...pathFromOcurrenceToHospital,
      ];

      const coordPath = vertexToCoordPath(
        vertexIndices,
        COORDS as LatLngTuple[]
      );

      // Define o estado 'path' com o array de coordenadas
      setPath(coordPath);
      setLoading(false);
    });
  };

  useEffect(() => {
    handleButtonClick();
  }, []);

  if (loading || !accident || !path) {
    return <p>Carregando mapa e dados da rota...</p>;
  }

  return (
    // Estrutura robusta para Tailwind: flex-col e h-screen para o pai
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-gray-100 shadow-md flex justify-between align-center">
        <div>
          <h1 className="text-xl font-bold">Visualização SAMU</h1>
        </div>
        <button
          onClick={handleButtonClick} // Ação no click
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" // Adicionando alguns estilos básicos para o botão
          disabled={loading}
        >
          {loading ? "Sorteando..." : "Sortear Vértice"}
        </button>
      </div>

      {/* CONTÊINER DO MAPA: flex-grow garante que ele ocupa o espaço restante */}
      <div className="flex-grow w-full">
        <Map
          // CORREÇÃO 3: Passar o caminho de coordenadas (path) para o componente Map
          route={path}
          nearestHospital={nearestHospital}
          accidentLocation={ocurrenceVertex} // Passa o estado atual
        />
      </div>
    </div>
  );
}

export default App;
