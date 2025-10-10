import React, { useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MapSelector = ({ onAddressSelect, selectedLocation }) => {
  const initialPosition = { lat: 19.83, lng: -90.53 }; // Centro en Campeche

  const handleMapClick = useCallback(async (event) => {
    const lat = event.detail.latLng.lat;
    const lng = event.detail.latLng.lng;
    
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
        const data = await response.json();
        const text = data.results?.[0]?.formatted_address || 'Ubicación seleccionada en el mapa';
        onAddressSelect({ lat, lng, text });
    } catch (error) {
        console.error("Error en geocodificación inversa:", error);
    }
  }, [onAddressSelect]);

  return (
    <APIProvider apiKey={apiKey}>
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
              <Pin backgroundColor={"#007BFF"} borderColor={"#000"} />
            </AdvancedMarker>
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapSelector;