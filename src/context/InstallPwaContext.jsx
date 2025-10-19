// src/context/InstallPwaContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast'; // <-- 1. IMPORTA EL TOAST

// 1. Crear el contexto
const InstallPwaContext = createContext();

// 2. Crear el Proveedor (Provider)
export const InstallPwaProvider = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    // Esta función captura el evento de instalación
    const handleBeforeInstallPrompt = (e) => {
      // Previene que se muestre la mini-barra de info de Chrome
      e.preventDefault();
      // Guarda el evento para que podamos usarlo después
      setInstallPrompt(e);
    };

    // Escuchamos el evento
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Limpiamos el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Función que llamará nuestro botón
  const handleInstall = async () => {
    if (!installPrompt) {
      toast.error('La aplicación no se puede instalar ahora.'); // <-- Notificación de error
      return; 
    }

    // Muestra el diálogo de instalación del navegador
    installPrompt.prompt();

    try {
      // Esperamos a que el usuario elija
      const { outcome } = await installPrompt.userChoice;

      // 2. REEMPLAZA LOS CONSOLE.LOG CON NOTIFICACIONES
      if (outcome === 'accepted') {
        toast.success('¡Aplicación instalada con éxito!'); // <-- Notificación de éxito
        setInstallPrompt(null); // Oculta el botón solo si acepta
      } else {
        toast.error('Instalación cancelada.'); // <-- Notificación de cancelación
      }

    } catch (error) {
      toast.error('Ocurrió un error durante la instalación.'); // <-- Notificación de error inesperado
      console.error('Error al instalar PWA:', error);
    }
  };

  return (
    <InstallPwaContext.Provider value={{ installPrompt, handleInstall }}>
      {children}
    </InstallPwaContext.Provider>
  );
};

// 3. Crear un hook personalizado para usarlo fácil
export const useInstallPWA = () => {
  return useContext(InstallPwaContext);
};