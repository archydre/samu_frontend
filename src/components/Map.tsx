import { useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  CircleMarker, // <--- 1. Importar CircleMarker
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import type { LatLngTuple } from "leaflet";
import { FaAmbulance } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";
import COORDS from "../../dots.json";

const start: LatLngTuple = [-5.1819654036, -37.3452597857];

// --- CONFIGURAÇÃO DOS ÍCONES ---

// 1. Ícone Padrão (Azul)
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// 2. Ícone de Acidente (Vermelho)
const ACCIDENT_ICON_URL =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";

const AccidentIcon = L.icon({
  iconUrl: ACCIDENT_ICON_URL,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 3. Ícone da Ambulância
const ambulanceMarkup = renderToStaticMarkup(
  <FaAmbulance style={{ fontSize: "30px", color: "black" }} />
);

const AmbulanceIcon = L.divIcon({
  html: ambulanceMarkup,
  className: "bg-transparent",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

// --- COMPONENTE DE ANIMAÇÃO ---
function AmbulanceMarker({ route }: { route: LatLngTuple[] }) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (!markerRef.current || route.length < 2) return;

    const marker = markerRef.current;
    let segmentIndex = 0;
    let progress = 0;
    let animationId: number;
    const speed = 0.008; // Ajuste a velocidade aqui

    const animate = () => {
      if (segmentIndex >= route.length - 1) return;

      const startPoint = route[segmentIndex];
      const endPoint = route[segmentIndex + 1];

      progress += speed;

      if (progress >= 1) {
        progress = 0;
        segmentIndex++;
        marker.setLatLng(endPoint);
      } else {
        const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * progress;
        const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * progress;
        marker.setLatLng([lat, lng]);
      }

      if (segmentIndex < route.length - 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    marker.setLatLng(route[0]);
    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [route]);

  return (
    <Marker
      ref={markerRef}
      position={route[0]}
      icon={AmbulanceIcon}
      zIndexOffset={1000}
    >
      <Popup>Ambulância em deslocamento</Popup>
    </Marker>
  );
}

// --- COMPONENTE PRINCIPAL DO MAPA ---

function Map({
  route,
  nearestHospital,
  accidentLocation,
  onNodeSelect,
  selectedIndex,
}: {
  route: LatLngTuple[];
  nearestHospital?: LatLngTuple;
  accidentLocation?: LatLngTuple;
  onNodeSelect?: (index: number) => void;
  selectedIndex: number | undefined;
}) {
  const showRoute = route && route.length > 2;

  return (
    <MapContainer
      center={start}
      zoom={14}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showRoute && (
        <Polyline positions={route} color="red" weight={3} opacity={0.6}>
          <Popup>Rota Completa</Popup>
        </Polyline>
      )}

      {showRoute ? (
        <AmbulanceMarker route={route} />
      ) : (
        <Marker position={start} icon={AmbulanceIcon}>
          <Popup>Central SAMU (Aguardando chamado)</Popup>
        </Marker>
      )}

      {/* 3. Renderização dos pontos do dots.json */}
      {COORDS.map((coord, index) => {
        const isSelected = selectedIndex === index;
        const color = isSelected ? "red" : "#3388ff";

        return (
          <CircleMarker
            key={index}
            center={coord as LatLngTuple}
            radius={10} // Tamanho da bolinha
            pathOptions={{
              color: color,
              fillColor: "#3388ff",
              fillOpacity: 0.5,
            }}
            eventHandlers={{
              click: () => {
                console.log(`Vértice clicado: ${index}`);
                // Chama a função do pai se ela existir
                if (onNodeSelect) onNodeSelect(index);
              },
            }}
          ></CircleMarker>
        );
      })}

      {nearestHospital && (
        <Marker position={nearestHospital}>
          <Popup>Hospital</Popup>
        </Marker>
      )}

      {accidentLocation && (
        <Marker position={accidentLocation} icon={AccidentIcon}>
          <Popup>Local do Acidente</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default Map;
