import { useMemo, useRef } from "react";
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

const start: LatLngTuple = [-5.1819654036, -37.3452597857];

// Configuração do ícone padrão azul (Mantida)
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const ACCIDENT_ICON_URL =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";

// 🆕 NOVO ÍCONE PARA O ACIDENTE (Vermelho)
const AccidentIcon = L.icon({
  iconUrl: ACCIDENT_ICON_URL, // <-- Usando o URL direto
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function Map({
  route,
  nearestHospital,
  accidentLocation,
}: {
  route: LatLngTuple[];
  nearestHospital?: LatLngTuple;
  accidentLocation?: LatLngTuple;
}) {
  const showRoute = route!.length > 2;

  const markerRef = useRef<L.Marker>(null);

  return (
    <MapContainer
      center={start} // Centraliza no último clique ou no SAMU
      zoom={14}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 1. COMPONENTE POLYLINE PARA TRAÇAR A ROTA */}
      {showRoute && (
        <Polyline positions={route} color="red" weight={3} opacity={0.8}>
          <Popup>
            Rota Completa: SAMU {"->"} Acidente {"->"} Hospital
          </Popup>
        </Polyline>
      )}

      {/* 2. MARCADOR DA CENTRAL DO SAMU (Usa o ícone padrão) */}
      {route && (
        <Marker position={start}>
          <Popup>Central SAMU (Origem da Rota)</Popup>
        </Marker>
      )}

      {/* 3. MARCADOR DO HOSPITAL (Usa o ícone padrão) */}
      {nearestHospital && (
        <Marker position={nearestHospital}>
          <Popup>Hospital Regional Tarcísio Maia (Destino da Rota)</Popup>
        </Marker>
      )}

      {/* 4. MARCADOR DO ACIDENTE (USA O NOVO ÍCONE VERMELHO) */}
      {accidentLocation && (
        <Marker position={accidentLocation} icon={AccidentIcon}>
          <Popup>Acidente</Popup>
        </Marker>
      )}

      {/* 5. AMBULÂNCIA ANIMADA (descomente quando tiver o AmbulanceMarker) */}
      {/* {showRoute && <AmbulanceMarker path={routePath} />} */}
    </MapContainer>
  );
}

export default Map;
