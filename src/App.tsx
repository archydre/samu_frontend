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

// Configuração do ícone do Leaflet...
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
  //const [accident, setAccident] = useState<Accident | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [path, setPath] = useState<LatLngTuple[]>([]);
  const [nearestHospital, setNearestHospital] = useState<LatLngTuple>();
  const [ocurrenceVertex, setOcurrenceVertex] = useState<LatLngTuple>();
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [routeAccidentIndex, setRouteAccidentIndex] = useState<
    number | undefined
  >();

  // ... (vertexToCoordPath e processAccidentData mantidos iguais) ...
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

  const processAccidentData = (data: Accident) => {
    const safeOcurrencePath = data.toOcurrencePath || [];
    const safeToHospitalPath = data.toHospitalPath || [];
    const accidentIndexInRoute = safeOcurrencePath.length - 1;
    const pathFromOcurrenceToHospital = safeToHospitalPath.slice(1);
    const vertexIndices = [
      ...safeOcurrencePath,
      ...pathFromOcurrenceToHospital,
    ];
    const coordPath = vertexToCoordPath(vertexIndices, COORDS as LatLngTuple[]);

    setSelectedIndex(data.ocurrenceVertex);
    //setAccident(data);
    setOcurrenceVertex(COORDS[data.ocurrenceVertex] as LatLngTuple);
    setNearestHospital(COORDS[data.hospitalVertex] as LatLngTuple);
    setPath(coordPath);
    setRouteAccidentIndex(accidentIndexInRoute);
    setLoading(false);
  };
  // ... (fim das funções auxiliares)

  const handleButtonClick = () => {
    setLoading(true);
    fetchOcurrence()
      .then(processAccidentData)
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    handleButtonClick();
    // Removido console.log(accident) daqui pois o state não atualiza imediatamente após mount
  }, []);

  const handleNodeSelect = async (vertexIndex: number) => {
    console.log("Novo destino selecionado:", vertexIndex);
    if (vertexIndex === 105 || vertexIndex === 66 || vertexIndex === 2) {
      console.log("Vértice ignorado.");
      return;
    }
    setLoading(true);
    setSelectedIndex(vertexIndex);

    try {
      const data = await fetchOcurrenceByVertex(vertexIndex);
      processAccidentData(data);
    } catch (error) {
      console.error("Erro ao buscar rota:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 1. Removemos a div wrapper (p-4 bg-gray-100...) 
          2. Passamos 'handleButtonClick' para a prop 'onRandomize'
          3. Tentei passar o executionTime se ele existir no objeto 'accident'
      */}
      <Header
        loading={loading}
        onRandomize={handleButtonClick}
        // Se o seu objeto Accident tiver um campo de tempo, passe aqui. Ex:
        // executionTime={accident?.executionTime}
      />

      <div className="flex-grow w-full relative">
        <Map
          route={path || []}
          nearestHospital={nearestHospital}
          accidentLocation={ocurrenceVertex}
          selectedIndex={selectedIndex}
          accidentIndex={routeAccidentIndex}
          onNodeSelect={handleNodeSelect}
        />
      </div>
    </div>
  );
}

export default App;
