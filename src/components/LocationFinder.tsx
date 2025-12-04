import { useMapEvents } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import React from "react";

/**
 * Componente invisível que escuta eventos de clique no mapa.
 * Quando o usuário clica, ele notifica o componente pai sobre a nova coordenada.
 * * @param {function} onLocationSelect - Função de callback que recebe a coordenada [lat, lng]
 */
function LocationFinder({
  onLocationSelect,
}: {
  onLocationSelect: (coords: LatLngTuple) => void;
}) {
  const map = useMapEvents({
    click: (e) => {
      // Captura a Latitude e Longitude do evento de clique
      const { lat, lng } = e.latlng;

      // Converte para LatLngTuple e chama a função de callback no App.tsx
      const newCoords: LatLngTuple = [lat, lng];
      onLocationSelect(newCoords);

      // Opcional: Centraliza o mapa no novo ponto de clique
      map.flyTo(newCoords, map.getZoom());
    },
  });

  // Este componente não renderiza nada visualmente no mapa.
  return null;
}

export default LocationFinder;
