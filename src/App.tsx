import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import type { LatLngTuple } from "leaflet";
import Map from "./components/Map";
import {
  fetchOcurrence,
  fetchOcurrenceByVertex,
  type Accident,
} from "./fetchs/fetchData";
import COORDS from "../dots.json";
import Header from "./components/Header";

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
  const [path, setPath] = useState<LatLngTuple[]>([]);
  const [nearestHospital, setNearestHospital] = useState<LatLngTuple>();
  const [ocurrenceVertex, setOcurrenceVertex] = useState<LatLngTuple>();
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  // Estado para o índice de parada DENTRO do array 'path'
  const [routeAccidentIndex, setRouteAccidentIndex] = useState<
    number | undefined
  >();

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

  /**
   * Processa os dados da rota e atualiza todos os estados relevantes.
   */
  const processAccidentData = (data: Accident) => {
    // 1. Definições de caminhos
    const safeOcurrencePath = data.toOcurrencePath || [];
    const safeToHospitalPath = data.toHospitalPath || [];

    // ✅ O índice do acidente na ROTA é o comprimento do array de ida menos 1.
    const accidentIndexInRoute = safeOcurrencePath.length - 1;

    // Remove o primeiro elemento da rota do hospital (que já é o acidente)
    const pathFromOcurrenceToHospital = safeToHospitalPath.slice(1);

    const vertexIndices = [
      ...safeOcurrencePath,
      ...pathFromOcurrenceToHospital,
    ];

    const coordPath = vertexToCoordPath(vertexIndices, COORDS as LatLngTuple[]);

    // 2. Atualização de estados
    setSelectedIndex(data.ocourrenceVertex); // Vértice no COORDS (para cor do ponto)
    setAccident(data);
    setOcurrenceVertex(COORDS[data.ocourrenceVertex] as LatLngTuple);
    setNearestHospital(COORDS[data.hospitalVertex] as LatLngTuple);
    setPath(coordPath);

    // Atualiza o índice de parada para a animação
    setRouteAccidentIndex(accidentIndexInRoute);

    setLoading(false);
  };

  const handleButtonClick = () => {
    setLoading(true);
    fetchOcurrence()
      .then(processAccidentData) // Reutiliza a função
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    handleButtonClick();
    console.log(accident);
  }, []);

  const handleNodeSelect = async (vertexIndex: number) => {
    console.log("Novo destino selecionado:", vertexIndex);
    // Adicionado tratamento de erro para vértices
    if (vertexIndex === 105 || vertexIndex === 66 || vertexIndex === 2) {
      console.log("Vértice ignorado.");
      return;
    }
    setLoading(true);
    setSelectedIndex(vertexIndex);

    try {
      const data = await fetchOcurrenceByVertex(vertexIndex);
      processAccidentData(data); // Processa os dados da nova rota
    } catch (error) {
      console.error("Erro ao buscar rota:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-gray-100 shadow-md flex justify-between items-center">
        {/* Componente Header */}
        <Header loading={loading} />

        {/* ✅ O BOTÃO DE VOLTA AQUI */}
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
        <Map
          route={path || []}
          nearestHospital={nearestHospital}
          accidentLocation={ocurrenceVertex}
          selectedIndex={selectedIndex} // Índice do COORDS (para cor)
          accidentIndex={routeAccidentIndex} // Índice da ROTA (para pausa da ambulância)
          onNodeSelect={handleNodeSelect}
        />
      </div>
    </div>
  );
}

export default App;
