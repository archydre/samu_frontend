import { useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FaAmbulance,
  FaHospital,
  FaExclamationTriangle,
  FaBuilding,
  FaMapMarkerAlt,
} from "react-icons/fa";
import COORDS from "../../dots.json";

const START_POS: LatLngTuple = [-5.1819654036, -37.3452597857];

// --- 1. GERADOR DE ÍCONES MODERNOS (HTML/TAILWIND) ---
// Cria ícones redondos, com sombra e borda branca, estilo "App Moderno"
const createModernIcon = (
  icon: React.ReactNode,
  bgColorClass: string,
  pulse: boolean = false
) => {
  const html = renderToStaticMarkup(
    <div
      className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg ${bgColorClass}`}
    >
      {pulse && (
        <span
          className={`absolute -inset-1 z-0 animate-ping rounded-full opacity-75 ${bgColorClass}`}
        ></span>
      )}
      <div className="z-10 text-white text-sm">{icon}</div>
    </div>
  );

  return L.divIcon({
    html: html,
    className: "bg-transparent", // Remove fundo padrão do leaflet
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Centralizado na horizontal, ponta embaixo
    popupAnchor: [0, -34],
  });
};

// Ícones Estáticos
const BaseIcon = createModernIcon(<FaBuilding />, "bg-slate-700");
const HospitalIcon = createModernIcon(<FaHospital />, "bg-emerald-500");
const AccidentIcon = createModernIcon(<FaExclamationTriangle />, "bg-red-500");
const TargetIcon = createModernIcon(<FaMapMarkerAlt />, "bg-blue-500", true); // Ícone pulsante para seleção

// Ícones Dinâmicos (Ambulância)
const AmbulanceEmptyIcon = createModernIcon(<FaAmbulance />, "bg-blue-600");
const AmbulancePatientIcon = createModernIcon(<FaAmbulance />, "bg-orange-500"); // Laranja para diferenciar volta

// --- COMPONENTE DE ANIMAÇÃO DA AMBULÂNCIA ---
function AmbulanceMarker({
  route,
  accidentIndex,
}: {
  route: LatLngTuple[];
  accidentIndex: number | undefined;
}) {
  const markerRef = useRef<L.Marker>(null);
  const PAUSE_TIME = 2000; // Tempo de resgate
  const timeoutIdRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!markerRef.current || route.length < 2) return;

    const marker = markerRef.current;
    let segmentIndex = 0;
    let progress = 0;
    // Aumentei um pouco a velocidade para parecer mais fluido
    const speed = 0.015;

    // Reinicia ícone e posição
    marker.setIcon(AmbulanceEmptyIcon);
    marker.setLatLng(route[0]);

    const animate = () => {
      if (segmentIndex >= route.length - 1) return;

      const startPoint = route[segmentIndex];
      const endPoint = route[segmentIndex + 1];

      progress += speed;

      if (progress >= 1) {
        progress = 0;
        segmentIndex++;
        marker.setLatLng(endPoint);

        // 🛑 Lógica de Pausa no Acidente
        if (accidentIndex !== undefined && segmentIndex === accidentIndex) {
          // Pausa animação
          timeoutIdRef.current = window.setTimeout(() => {
            // Troca ícone para "Com Paciente"
            marker.setIcon(AmbulancePatientIcon);
            // Continua
            if (segmentIndex < route.length - 1) {
              animationFrameRef.current = requestAnimationFrame(animate);
            }
          }, PAUSE_TIME);
          return; // Sai do loop atual para esperar o timeout
        }
      } else {
        // Interpolação Linear para suavidade
        const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * progress;
        const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * progress;
        marker.setLatLng([lat, lng]);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (timeoutIdRef.current) window.clearTimeout(timeoutIdRef.current);
    };
  }, [route, accidentIndex]);

  return (
    <Marker
      ref={markerRef}
      position={route[0]}
      icon={AmbulanceEmptyIcon}
      zIndexOffset={1000} // Ambulância sempre por cima
    >
      <Popup className="font-sans text-xs font-semibold">
        Viatura em deslocamento
      </Popup>
    </Marker>
  );
}

// --- UTILITÁRIO PARA AJUSTAR ZOOM (Opcional, melhora UX) ---
function AutoZoom({ route }: { route: LatLngTuple[] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);
  return null;
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

  // Filtragem visual dos pontos para performance e estética
  // Renderizamos apenas pontos NÃO selecionados como CircleMarkers simples
  // O ponto selecionado vira um Marker especial
  const otherPoints = useMemo(() => {
    return COORDS.map((coord, index) => {
      if (index === selectedIndex) return null; // Não renderiza o selecionado aqui
      return (
        <CircleMarker
          key={index}
          center={coord as LatLngTuple}
          radius={4} // Menor para ficar elegante
          pathOptions={{
            color: "transparent", // Sem borda
            fillColor: "#0a6ffbff", // Slate-400 (Cinza neutro)
            fillOpacity: 0.5,
          }}
          eventHandlers={{
            click: () => onNodeSelect && onNodeSelect(index),
            mouseover: (e) =>
              e.target.setStyle({
                fillColor: "#3b82f6",
                fillOpacity: 1,
                radius: 6,
              }), // Hover effect azul
            mouseout: (e) =>
              e.target.setStyle({
                fillColor: "#94a3b8",
                fillOpacity: 0.5,
                radius: 4,
              }),
          }}
        />
      );
    });
  }, [selectedIndex, onNodeSelect]);

  return (
    <MapContainer
      center={START_POS}
      zoom={14}
      scrollWheelZoom={true}
      className="h-full w-full bg-slate-50" // Fundo cinza claro caso o tile demore
      zoomControl={false} // Vamos reposicionar ou usar padrão
    >
      {/* MUDANÇA VISUAL 1: CartoDB Positron 
         Um mapa cinza claro, limpo, que faz as rotas coloridas saltarem aos olhos.
      */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* Auto zoom na rota ativa */}
      {showRoute && <AutoZoom route={route} />}

      {/* Rota (Linha) */}
      {showRoute && (
        <>
          {/* Linha de fundo (borda) para contraste */}
          <Polyline positions={route} color="white" weight={6} opacity={0.8} />
          {/* Linha principal Azul SAMU */}
          <Polyline
            positions={route}
            color="#2563eb"
            weight={3}
            opacity={0.9}
            dashArray="1, 0"
          />

          <AmbulanceMarker route={route} accidentIndex={accidentIndex} />
        </>
      )}

      {/* Marcador da Base (Sempre visível se não tiver rota ativa saindo dele, ou sempre visível mesmo) */}
      <Marker position={START_POS} icon={BaseIcon}>
        <Popup>Central SAMU</Popup>
      </Marker>

      {/* Pontos clicáveis do grafo (Discretos) */}
      {otherPoints}

      {/* Marcador de Destino/Seleção (Pulsante) */}
      {selectedIndex !== undefined && (
        <Marker
          position={COORDS[selectedIndex] as LatLngTuple}
          icon={TargetIcon}
          zIndexOffset={500}
        >
          {/* Popup abre automático se quiser, ou apenas no clique */}
        </Marker>
      )}

      {/* Hospital */}
      {nearestHospital && (
        <Marker
          position={nearestHospital}
          icon={HospitalIcon}
          zIndexOffset={900}
        >
          <Popup>Hospital Mais Próximo</Popup>
        </Marker>
      )}

      {/* Acidente (Fixo) */}
      {accidentLocation && (
        <Marker
          position={accidentLocation}
          icon={AccidentIcon}
          zIndexOffset={900}
        >
          <Popup>Local da Ocorrência</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default Map;
