import React from 'react';

// Si no tienes 'lucide-react' instalado, no te preocupes, he usado emojis y texto estándar.
// Si lo tienes y quieres usarlo, descomenta la siguiente línea:
// import { X, MapPin, Navigation } from 'lucide-react'; 

const LocationModal = ({ show, handleClose }) => {
  // 1. Si "show" es falso, no renderizamos nada.
  if (!show) return null;

  // Dirección exacta
  const addressQuery = "C.+5+12,+Samulá,+24090+San+Francisco+de+Campeche,+Camp.";
  
  // URL correcta para el iframe de Google Maps
  const mapSrc = `https://maps.google.com/maps?q=${addressQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // URL correcta para el botón "Ir al local" (Google Maps Directions)
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${addressQuery}`;

  return (
    // 2. Usamos clases de Bootstrap (modal, fade, show) y estilo inline para el fondo oscuro
    <div 
      className="modal fade show" 
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }} 
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content">
          
          {/* --- ENCABEZADO --- */}
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title d-flex align-items-center">
              <span className="me-2">📍</span> Ubicación
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose} 
              aria-label="Close"
            ></button>
          </div>

          {/* --- CUERPO (MAPA) --- */}
          <div className="modal-body p-0">
            <div style={{ width: '100%', height: '400px' }}>
              <iframe 
                title="Mapa de Ubicación"
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src={mapSrc}
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-3 bg-light">
              <p className="mb-0 text-muted small">
                <strong>Dirección:</strong> C. 5 12, Samulá, 24090 San Francisco de Campeche, Camp.
              </p>
            </div>
          </div>

          {/* --- PIE DE PÁGINA --- */}
          <div className="modal-footer justify-content-between">
            <span className="text-muted small d-none d-sm-block">
              ¡Te esperamos con el mejor sabor! 🦔
            </span>
            
            <div className="d-flex gap-2 w-100 w-sm-auto justify-content-end">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose}
              >
                Cerrar
              </button>
              
              <a 
                href={directionsLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Cómo llegar 🚀
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LocationModal;