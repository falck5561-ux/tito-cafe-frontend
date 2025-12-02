// Archivo: src/pages/NosotrosPage.jsx (VERSIÓN MEJORADA)
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Award, Zap, Heart, Utensils, ChefHat } from 'lucide-react'; // Cambié Clock por Zap y CheckCircle por Heart

function NosotrosPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const bgBase = isDark ? '#09090b' : '#f3f4f6';
    const textMain = isDark ? '#ffffff' : '#1f2937';
    const cardBg = isDark ? '#18181b' : '#ffffff';
    
    // Gradient de acento (Rojo/Azul)
    const accentGradient = isDark 
        ? 'linear-gradient(135deg, #2563eb, #1e40af)' 
        : 'linear-gradient(135deg, #ef4444, #b91c1c)';
    
    // Color de acento para la cita
    const accentColor = isDark ? 'text-blue-400' : 'text-red-600';

    return (
        <div style={{ backgroundColor: bgBase, minHeight: '100vh', color: textMain, paddingTop: '2rem', paddingBottom: '5rem' }}>
            <div className="container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    
                    {/* Título Principal */}
                    <div className="text-center mb-5">
                        <h1 className="display-4 fw-bold mb-3">Nuestra Historia</h1>
                        <div className="d-inline-block h-1 w-25 rounded" style={{ background: accentGradient, height: '6px' }}></div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            {/* Card Principal con diseño más limpio */}
                            <div className="card border-0 shadow-xl overflow-hidden" style={{ backgroundColor: cardBg, borderRadius: '32px' }}>
                                
                                {/* 1. BANNER DECORATIVO (Con patrón y overlay) */}
                                <div style={{ height: '200px', background: accentGradient, position: 'relative' }}>
                                    {/* Patrón de textura sutil */}
                                    <div className="position-absolute w-100 h-100" style={{ background: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.15 }}></div>
                                    {/* Capa oscura en el fondo para que la foto destaque */}
                                    <div className="position-absolute w-100 h-100" style={{ background: isDark ? 'linear-gradient(to top, #18181b 0%, rgba(0,0,0,0) 100%)' : 'linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0) 100%)' }}></div>
                                </div>

                                <div className="card-body p-4 p-md-5 text-center" style={{ marginTop: '-120px' }}>
                                    
                                    {/* 2. FOTO DEL JEFE (Más grande, mejor marco) */}
                                    <motion.div 
                                        initial={{ scale: 0.8, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} 
                                        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                                        className="d-inline-block position-relative mb-4 p-1 rounded-circle shadow-2xl"
                                        style={{ background: accentGradient }}
                                    >
                                        <img 
                                            src="/titojefe.png" // Asegúrate de que esta ruta sea correcta
                                            alt="Tito Perez Ponce" 
                                            className="rounded-circle object-cover border-4"
                                            style={{ 
                                                width: '200px', 
                                                height: '200px', 
                                                borderColor: cardBg,
                                                backgroundColor: cardBg,
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div className="position-absolute bottom-0 end-0 me-1 mb-1 p-2 rounded-circle shadow-lg" style={{ background: accentGradient }}>
                                            <ChefHat size={24} color="white" />
                                        </div>
                                    </motion.div>

                                    <h2 className="fw-bold mb-1">Tito Spot</h2>
                                    <p className={`${accentColor} fw-bold`}>Fundado por Tito Perez Ponce</p>

                                    {/* LA FRASE DEL ERIZO (Estilo Blockquote) */}
                                    <div className="col-md-9 mx-auto mb-5 mt-4">
                                        <div className={`p-4 rounded-3xl position-relative shadow-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`} style={{ borderLeft: `5px solid ${isDark ? '#2563eb' : '#dc2626'}` }}>
                                            <p className="fs-5 fst-italic mb-0" style={{ lineHeight: '1.6', color: isDark ? '#ccc' : '#4a4a4a' }}>
                                                "Aunque los erizos tenemos fama de ser 'picudos', mi compromiso es dejar las espinas afuera y ponerle todo el corazón a tu comida, para ofrecerte un servicio suave y delicioso."
                                            </p>
                                            <footer className={`${accentColor} mt-2 small fw-semibold d-block text-end`}>— Tito Perez Ponce</footer>
                                        </div>
                                    </div>

                                    {/* 3. SECCIÓN DE VALORES (Mejora estética de tarjetas) */}
                                    <h3 className="fw-bold mb-4 mt-5">Nuestros Pilares</h3>
                                    <div className="row g-4 justify-content-center text-center">
                                        {/* Tarjeta 1: Calidad */}
                                        <div className="col-md-4">
                                            <motion.div 
                                                whileHover={{ scale: 1.05, boxShadow: '0 8px 15px rgba(0,0,0,0.2)' }}
                                                className={`p-4 rounded-3xl h-100 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                            >
                                                <Utensils className={`${accentColor} mb-3`} size={40} />
                                                <h5 className="fw-bold">Calidad</h5>
                                                <p className="small opacity-75 mb-0">Ingredientes seleccionados minuciosamente para garantizar el mejor sabor en cada bocado.</p>
                                            </motion.div>
                                        </div>
                                        {/* Tarjeta 2: Rapidez */}
                                        <div className="col-md-4">
                                            <motion.div 
                                                whileHover={{ scale: 1.05, boxShadow: '0 8px 15px rgba(0,0,0,0.2)' }}
                                                className={`p-4 rounded-3xl h-100 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                            >
                                                <Zap className={`${accentColor} mb-3`} size={40} />
                                                <h5 className="fw-bold">Rapidez</h5>
                                                <p className="small opacity-75 mb-0">Tu tiempo vale oro, por eso nos enfocamos en entregas súper eficientes.</p>
                                            </motion.div>
                                        </div>
                                        {/* Tarjeta 3: Confianza */}
                                        <div className="col-md-4">
                                            <motion.div 
                                                whileHover={{ scale: 1.05, boxShadow: '0 8px 15px rgba(0,0,0,0.2)' }}
                                                className={`p-4 rounded-3xl h-100 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                                            >
                                                <Heart className={`${accentColor} mb-3`} size={40} />
                                                <h5 className="fw-bold">Confianza</h5>
                                                <p className="small opacity-75 mb-0">Un servicio transparente y honesto, porque eres parte de la familia Tito Spot.</p>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default NosotrosPage;