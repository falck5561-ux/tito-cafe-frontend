// Archivo: src/components/MapSelector.jsx (con depuración)

import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import toast from 'react-hot-toast';

function MapSelector({ onLocationSelect }) {
  // Coordenadas de Campeche para centrar el mapa
  const initialPosition = { lat: 19.8465, lng: -90.5379 }; 
  const [selectedPosition, setSelectedPosition] = useState(null);

  const handleMapClick = (event) => {
    // --- NUESTRO ESPÍA ---
    // Si ves este mensaje en la consola al hacer clic, ¡sabremos que el mapa funciona!
    console.log("¡Clic en el mapa detectado!", event.detail.latLng);
    // --------------------

    const lat = event.detail.latLng.lat;
    const lng = event.detail.latLng.lng;
    const newPosition = { lat, lng };

    setSelectedPosition(newPosition);
    onLocationSelect(newPosition); 
    toast.success('Ubicación seleccionada en el mapa.');
  };

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={initialPosition}
          defaultZoom={14} // Un poco más de zoom para ver mejor
          mapId="tito-cafe-map"
          onClick={handleMapClick}
          gestureHandling={'greedy'} // 'greedy' permite toda la interacción
          disableDefaultUI={true}
        >
          {selectedPosition && (
            <AdvancedMarker position={selectedPosition}>
              <Pin />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
      <p className="form-text text-center mt-2">Haz clic en el mapa para fijar tu ubicación.</p>
    </div>
  );
}

export default MapSelector;