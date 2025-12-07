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

const patientAmbulanceMarkup = renderToStaticMarkup(
  <FaAmbulance style={{ fontSize: "30px", color: "red" }} /> // Cor vermelha ou diferente
);

const PatientAmbulanceIcon = L.divIcon({
  html: patientAmbulanceMarkup,
  className: "bg-transparent",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

// --- COMPONENTE DE ANIMAÇÃO ---
// --- COMPONENTE DE ANIMAÇÃO ---
function AmbulanceMarker({
  route,
  accidentIndex,
}: {
  route: LatLngTuple[];
  accidentIndex: number | undefined;
}) {
  const markerRef = useRef<L.Marker>(null);
  const PAUSE_TIME = 3000;
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!markerRef.current || route.length < 2) return;

    const marker = markerRef.current;
    let segmentIndex = 0;
    let progress = 0;
    let animationId: number;
    const speed = 0.008;

    const animate = () => {
      if (segmentIndex >= route.length - 1) return;

      const startPoint = route[segmentIndex];
      const endPoint = route[segmentIndex + 1];

      progress += speed;

      if (progress >= 1) {
        progress = 0;
        segmentIndex++;
        marker.setLatLng(endPoint);

        // 🛑 LÓGICA DE PAUSA
        if (accidentIndex !== undefined && segmentIndex === accidentIndex) {
          console.log(`Ambulância chegou ao acidente. Pausando...`);

          timeoutIdRef.current = window.setTimeout(() => {
            // ✅ AQUI É O PONTO CHAVE: Troca o ícone após a pausa
            marker.setIcon(PatientAmbulanceIcon); // Define o novo ícone

            // Recomeça a animação
            if (segmentIndex < route.length - 1) {
              animationId = requestAnimationFrame(animate);
            }
          }, PAUSE_TIME);

          return;
        }
      } else {
        // Movimento suave
        const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * progress;
        const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * progress;
        marker.setLatLng([lat, lng]);
      }

      animationId = requestAnimationFrame(animate);
    };

    // Certifica-se de que o ícone inicial é o AmbulanceIcon padrão
    marker.setIcon(AmbulanceIcon);
    marker.setLatLng(route[0]);
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
      }
    };
  }, [route, accidentIndex]);

  // A posição inicial agora deve ser configurada no useEffect, mas o Marker precisa de uma posição inicial
  return (
    <Marker
      ref={markerRef}
      position={route[0]}
      icon={AmbulanceIcon} // Ícone inicial
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
  accidentIndex,
}: {
  route: LatLngTuple[];
  nearestHospital?: LatLngTuple;
  accidentLocation?: LatLngTuple;
  onNodeSelect?: (index: number) => void;
  selectedIndex: number | undefined;
  accidentIndex: number | undefined;
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
        // ✅ 1. CORREÇÃO: Passando o 'accidentIndex' (índice da ROTA)
        <AmbulanceMarker route={route} accidentIndex={accidentIndex} />
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
              fillColor: color, // ✅ 2. CORREÇÃO: Usa a cor condicional também no preenchimento
              fillOpacity: 0.7, // Aumenta a opacidade para destacar
            }}
            eventHandlers={{
              click: () => {
                console.log(`Vértice clicado: ${index}`);
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
