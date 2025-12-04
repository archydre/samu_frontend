import React, { useMemo, useRef } from "react";
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
import LocationFinder from "./LocationFinder"; // Garante a importação
// Importe AmbulanceMarker se ele estiver em um arquivo separado
// import { AmbulanceMarker } from "./AmbulanceMarker";

// Central SAMU (Origem fixa)
const start: LatLngTuple = [-5.1845, -37.336];

// Configuração do ícone (mantida do App.tsx para este componente funcionar,
// embora deva ser feita uma vez no ponto de entrada).
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function Map({
  route,
  nearestHospital,
  acidenteLocation, // Adicionado para visualizar o ponto clicado
  onLocationSelect, // Adicionado para capturar o clique
}: {
  route?: LatLngTuple[];
  nearestHospital: LatLngTuple;
  acidenteLocation: LatLngTuple | undefined; // Novo prop para o local do acidente
  onLocationSelect: (coords: LatLngTuple) => void;
}) {
  // CRIAÇÃO DO CAMINHO COMPLETO: [SAMU, ...Rota Intermediária, Hospital]
  const routePath: LatLngTuple[] = [start, ...(route || []), nearestHospital];

  const showRoute = routePath.length > 2;

  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newCoords = marker.getLatLng();
          // CHAMA O HANDLER: Isso é o que atualiza o estado do App.tsx
          onLocationSelect([newCoords.lat, newCoords.lng]);
        }
      },
    }),
    [onLocationSelect] // Dependência no handler do App.tsx
  );

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

      <LocationFinder onLocationSelect={onLocationSelect} />

      {/* 1. COMPONENTE POLYLINE PARA TRAÇAR A ROTA */}
      {showRoute && (
        <Polyline positions={routePath} color="red" weight={3} opacity={0.8}>
          <Popup>
            Rota Completa: SAMU {"->"} Acidente {"->"} Hospital
          </Popup>
        </Polyline>
      )}

      {/* 2. MARCADOR DA CENTRAL DO SAMU */}
      {route && (
        <Marker position={start}>
          <Popup>Central SAMU (Origem da Rota)</Popup>
        </Marker>
      )}

      {/* 3. MARCADOR DO HOSPITAL */}
      {route && (
        <Marker position={nearestHospital}>
          <Popup>Hospital Regional Tarcísio Maia (Destino da Rota)</Popup>
        </Marker>
      )}

      {/* 4. MARCADOR DO ACIDENTE CLICADO */}
      {acidenteLocation && (
        <Marker
          draggable={true} // Isso o torna arrastável
          eventHandlers={eventHandlers} // Isso captura o evento de soltar
          position={acidenteLocation}
          ref={markerRef}
        >
          <Popup>
            🚨 Local do Acidente. Arraste para reposicionar! <br />
            Lat: {acidenteLocation[0].toFixed(4)}, Lng:{" "}
            {acidenteLocation[1].toFixed(10)}
          </Popup>
        </Marker>
      )}

      {/* 5. AMBULÂNCIA ANIMADA (descomente quando tiver o AmbulanceMarker) */}
      {/* {showRoute && <AmbulanceMarker path={routePath} />} */}
    </MapContainer>
  );
}

export default Map;
