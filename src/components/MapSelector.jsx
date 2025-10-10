import React, { useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

// Clave de API desde el archivo .env
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MapSelector = ({ onAddressSelect }) => {
  // Coordenadas iniciales (Campeche, México)
  const initialPosition = { lat: 19.83, lng: -90.53 };
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [addressText, setAddressText] = useState('Haz clic en el mapa para seleccionar tu ubicación...');

  // Función para obtener la dirección a partir de las coordenadas
  const getAddressFromLatLng = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return 'No se pudo encontrar la dirección.';
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return 'Error al obtener la dirección.';
    }
  }, []);

  const handleMapClick = useCallback(async (event) => {
    const lat = event.detail.latLng.lat;
    const lng = event.detail.latLng.lng;
    
    setSelectedPosition({ lat, lng });
    setAddressText('Buscando dirección...');

    const textAddress = await getAddressFromLatLng(lat, lng);
    setAddressText(textAddress);

    // Enviamos el objeto completo (texto y coordenadas) al componente padre
    onAddressSelect({
      text: textAddress,
      lat: lat,
      lng: lng
    });
  }, [getAddressFromLatLng, onAddressSelect]);

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ height: '300px', width: '100%', marginTop: '15px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <Map
          defaultCenter={initialPosition}
          defaultZoom={13}
          mapId="TITO_CAFE_DELIVERY_MAP"
          onClick={handleMapClick}
          gestureHandling={'greedy'}
        >
          {selectedPosition && (
            <AdvancedMarker position={selectedPosition}>
              <Pin backgroundColor={"#007BFF"} borderColor={"#000"} />
            </AdvancedMarker>
          )}
        </Map>
      </div>
      <p className="mt-2 text-center" style={{ fontStyle: 'italic' }}>
        <strong>Ubicación seleccionada:</strong> {addressText}
      </p>
    </APIProvider>
  );
};

export default MapSelector;