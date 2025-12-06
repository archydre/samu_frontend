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
  // Inicialize com array vazio para não quebrar o Map na primeira renderização
  const [path, setPath] = useState<LatLngTuple[]>([]);
  const [nearestHospital, setNearestHospital] = useState<LatLngTuple>();
  const [ocurrenceVertex, setOcurrenceVertex] = useState<LatLngTuple>();

  // ... (função vertexToCoordPath mantém igual) ...
  const vertexToCoordPath = (
    vertexPath: number[],
    coordsArray: LatLngTuple[]
  ): LatLngTuple[] => {
    return vertexPath
      .map((vertexIndex) => coordsArray[vertexIndex])
      .filter(
        (coord): coord is LatLngTuple => coord !== undefined && coord !== null
      );
  };

  const handleButtonClick = () => {
    setLoading(true);

    fetchOcurrence()
      .then((data: Accident) => {
        setAccident(data);
        // ... (lógica de processamento mantém igual) ...
        const occurrenceCoord = COORDS[data.ocourrenceVertex];
        setOcurrenceVertex(
          occurrenceCoord ? (occurrenceCoord as LatLngTuple) : undefined
        );

        setNearestHospital(COORDS[data.hospitalVertex] as LatLngTuple);

        const safeOcurrencePath = data.toOcurrencePath || [];
        const safeToHospitalPath = data.toHospitalPath || [];
        const pathFromOcurrenceToHospital = safeToHospitalPath.slice(1);

        const vertexIndices = [
          ...safeOcurrencePath,
          ...pathFromOcurrenceToHospital,
        ];

        const coordPath = vertexToCoordPath(
          vertexIndices,
          COORDS as LatLngTuple[]
        );

        setPath(coordPath);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false); // Garante que o loading para mesmo com erro
      });
  };

  useEffect(() => {
    handleButtonClick();
  }, []);

  // REMOVIDO O IF DE RETURN ANTECIPADO AQUI

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-gray-100 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Visualização SAMU</h1>
          {/* Exibe o status aqui sem remover o mapa */}
          {loading && (
            <span className="text-blue-600 text-sm animate-pulse">
              Atualizando rota...
            </span>
          )}
        </div>

        <button
          onClick={handleButtonClick}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Calculando..." : "Sortear Vértice"}
        </button>
      </div>

      <div className="flex-grow w-full relative">
        {/* O Map é renderizado mesmo se path estiver vazio */}
        <Map
          route={path || []} // Garante array vazio se for undefined
          nearestHospital={nearestHospital}
          accidentLocation={ocurrenceVertex}
        />
      </div>
    </div>
  );
}

export default App;
