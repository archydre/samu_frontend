import { useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import type { LatLngTuple } from "leaflet";
import Map from "./components/Map";
import LocationFinder from "./components/LocationFinder";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const hospital2Coords: LatLngTuple = [-5.1995, -37.341];

const rotaSimulada: LatLngTuple[] = [
  [-5.188, -37.35],
  [-5.192, -37.34],
];

function App() {
  const [coordinate, setCoordinate] = useState<LatLngTuple>();
  const [accidentLocation, setAccidentLocation] = useState<
    LatLngTuple | undefined
  >([-5.189724416376373, -37.364884819909065]);

  return (
    // Estrutura robusta para Tailwind: flex-col e h-screen para o pai
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-gray-100 shadow-md">
        <h1 className="text-xl font-bold">Visualização SAMU</h1>
        <p className="text-sm">
          Clique no mapa para simular o local de um acidente.
        </p>
        {accidentLocation && (
          <p className="mt-2 text-green-700">
            Último Acidente: Lat {accidentLocation[0].toFixed(4)}, Lng{" "}
            {accidentLocation[1].toFixed(4)}
          </p>
        )}
      </div>

      {/* CONTÊINER DO MAPA: flex-grow garante que ele ocupa o espaço restante */}
      <div className="flex-grow w-full">
        <Map
          nearestHospital={hospital2Coords}
          acidenteLocation={accidentLocation} // Passa o estado atual
          onLocationSelect={(coords) => {
            console.log(coords);
            setAccidentLocation(coords);
          }} // Passa o handler de clique
        />
      </div>
    </div>
  );
}

export default App;
