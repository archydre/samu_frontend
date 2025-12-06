import { useEffect, useRef } from "react";
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
import { FaAmbulance } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";

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

// 3. Ícone da Ambulância (React Icon convertido para HTML)
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

// --- NOVO COMPONENTE DE ANIMAÇÃO ---

/**
 * Componente que controla a animação da ambulância ao longo da rota.
 */
function AmbulanceMarker({ route }: { route: LatLngTuple[] }) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    // Se não houver rota ou marcador, não faz nada
    if (!markerRef.current || route.length < 2) return;

    const marker = markerRef.current;
    let segmentIndex = 0;
    let progress = 0;
    let animationId: number;

    // CONFIGURAÇÃO DA VELOCIDADE
    // Aumente para ir mais rápido, diminua para ir mais devagar.
    // 0.05 significa que ele percorre 5% do segmento por frame (~20 frames por segmento)
    const speed = 0.008;

    const animate = () => {
      // Se chegou ao fim da rota completa, para a animação
      if (segmentIndex >= route.length - 1) return;

      const startPoint = route[segmentIndex];
      const endPoint = route[segmentIndex + 1];

      // Incrementa o progresso no segmento atual
      progress += speed;

      if (progress >= 1) {
        // Se completou o segmento, avança para o próximo
        progress = 0;
        segmentIndex++;
        marker.setLatLng(endPoint); // Garante que termine exatamente no ponto
      } else {
        // Interpolação Linear (calcula o ponto intermediário)
        const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * progress;
        const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * progress;
        marker.setLatLng([lat, lng]);
      }

      // Continua o loop se ainda houver segmentos
      if (segmentIndex < route.length - 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    // Posiciona no início e começa a animação
    marker.setLatLng(route[0]);
    animationId = requestAnimationFrame(animate);

    // Limpeza ao desmontar (cancela a animação para não dar erro)
    return () => cancelAnimationFrame(animationId);
  }, [route]);

  // Renderiza o marcador inicialmente na primeira posição da rota
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
}: {
  route: LatLngTuple[];
  nearestHospital?: LatLngTuple;
  accidentLocation?: LatLngTuple;
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Rota (Linha Vermelha) */}
      {showRoute && (
        <Polyline positions={route} color="red" weight={3} opacity={0.6}>
          <Popup>Rota Completa</Popup>
        </Polyline>
      )}

      {/* Se houver rota, mostra a Ambulância Animada. 
          Se não, mostra a ambulância parada na base. */}
      {showRoute ? (
        <AmbulanceMarker route={route} />
      ) : (
        <Marker position={start} icon={AmbulanceIcon}>
          <Popup>Central SAMU (Aguardando chamado)</Popup>
        </Marker>
      )}

      {/* Hospital */}
      {nearestHospital && (
        <Marker position={nearestHospital}>
          <Popup>Hospital</Popup>
        </Marker>
      )}

      {/* Acidente */}
      {accidentLocation && (
        <Marker position={accidentLocation} icon={AccidentIcon}>
          <Popup>Local do Acidente</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default Map;
