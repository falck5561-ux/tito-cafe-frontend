import React from 'react';
import { X, MapPin, Navigation } from 'lucide-react'; // Asegúrate de tener lucide-react o usa texto

const LocationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Dirección codificada para la URL
  const addressQuery = "C.+5+12,+Samulá,+24090+San+Francisco+de+Campeche,+Camp.";
  
  // Enlace directo para que el GPS calcule la ruta desde donde esté el cliente
  const googleMapsDirectionsLink = `https://www.google.com/maps/dir//${addressQuery}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#121212] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden transform transition-all scale-100">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#1a1a1a]">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-orange-500"><MapPin fill="currentColor" /></span> 
              Ubicación
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              C. 5 12, Samulá, Campeche
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mapa Visual (Iframe) */}
        <div className="w-full h-[350px] bg-gray-900 relative">
          {/* He generado un iframe automático con tu dirección. 
              Si quieres que se vea más específico (con la foto del local), 
              puedes reemplazar este src con el que te da Google Maps en "Compartir -> Insertar mapa" */}
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            src={`https://maps.google.com/maps?width=100%25&height=600&hl=es&q=${addressQuery}&t=&z=16&ie=UTF8&iwloc=B&output=embed`}
            style={{ filter: "invert(90%) hue-rotate(180deg)" }} // Truco opcional para modo oscuro (puedes quitar esta linea si prefieres el mapa a color normal)
            allowFullScreen
          ></iframe>
        </div>

        {/* Pie del Modal: Botón de Acción */}
        <div className="p-5 bg-[#1a1a1a] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center sm:text-left">
            ¡Te esperamos con el mejor sabor! 🦔
          </p>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-gray-300 hover:text-white transition-colors border border-gray-700 rounded-lg hover:bg-gray-800"
            >
              Cerrar
            </button>
            
            <a 
              href={googleMapsDirectionsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 hover:scale-105"
            >
              <Navigation size={18} />
              Ir al Local
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LocationModal;