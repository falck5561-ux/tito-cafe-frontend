// Archivo: src/components/MapSelector.jsx (Corregido)

import React, { useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const MapSelector = ({ onAddressSelect, selectedLocation }) => {
  const initialPosition = { lat: 19.83, lng: -90.53 };

  const handleMapClick = useCallback(async (event) => {
    const lat = event.detail.latLng.lat;
    const lng = event.detail.latLng.lng;
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat, lng };
      const { results } = await geocoder.geocode({ location: latlng });

      if (results && results.length > 0) {
        onAddressSelect({ lat, lng, text: results[0].formatted_address });
      } else {
        onAddressSelect({ lat, lng, text: 'Ubicación seleccionada en el mapa' });
      }
    } catch (error) {
      console.error("Error en geocodificación inversa:", error);
    }
  }, [onAddressSelect]);

  return (
    <APIProvider>
      <div style={{ height: '250px', width: '100%', marginTop: '15px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <Map
          center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : initialPosition}
          zoom={selectedLocation ? 17 : 13}
          mapId="TITO_CAFE_DELIVERY_MAP"
          onClick={handleMapClick}
          gestureHandling={'greedy'}
        >
          {selectedLocation && (
            <AdvancedMarker position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}>
              {/* ===== ESTA ES LA LÍNEA QUE SE CORRIGIÓ ===== */}
              <Pin background={'#007BFF'} borderColor={'#000'} />
            </AdvancedMarker>
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapSelector;