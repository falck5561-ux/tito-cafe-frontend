// src/context/InstallPwaContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

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
    if (!installPrompt) return; // Si no hay evento, no hacemos nada

    // Muestra el diálogo de instalación del navegador
    installPrompt.prompt();

    // Esperamos a que el usuario elija
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('El usuario aceptó instalar la PWA');
    } else {
      console.log('El usuario rechazó instalar la PWA');
    }

    // Ya sea que acepte o rechace, limpiamos el evento
    setInstallPrompt(null);
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