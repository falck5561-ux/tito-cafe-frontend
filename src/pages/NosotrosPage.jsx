// Archivo: src/pages/NosotrosPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Award, Clock, CheckCircle, ChefHat } from 'lucide-react';

function NosotrosPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const bgBase = isDark ? '#09090b' : '#f3f4f6';
    const textMain = isDark ? '#ffffff' : '#1f2937';
    const cardBg = isDark ? '#18181b' : '#ffffff';
    const accentGradient = isDark 
        ? 'linear-gradient(135deg, #2563eb, #1e40af)' 
        : 'linear-gradient(135deg, #ef4444, #b91c1c)';

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
                            <div className="card border-0 shadow-2xl overflow-hidden" style={{ backgroundColor: cardBg, borderRadius: '32px' }}>
                                
                                {/* Banner Decorativo */}
                                <div style={{ height: '150px', background: accentGradient, position: 'relative' }}>
                                    <div className="position-absolute w-100 h-100" style={{ background: 'url("https://www.transparenttextures.com/patterns/food.png")', opacity: 0.1 }}></div>
                                </div>

                                <div className="card-body p-4 p-md-5 text-center" style={{ marginTop: '-80px' }}>
                                    
                                    {/* FOTO DEL JEFE */}
                                    <motion.div 
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} 
                                        className="d-inline-block position-relative mb-4"
                                    >
                                        <img 
                                            src="/titojefe.png" 
                                            alt="Tito Perez Ponce" 
                                            className="rounded-circle shadow-lg object-cover border-4"
                                            style={{ 
                                                width: '180px', 
                                                height: '180px', 
                                                borderColor: cardBg,
                                                backgroundColor: cardBg,
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div className="position-absolute bottom-0 end-0 p-3 rounded-circle border-4 border-white bg-success shadow-sm">
                                            <ChefHat size={24} color="white" />
                                        </div>
                                    </motion.div>

                                    <h2 className="fw-bold mb-1">Tito Spot</h2>
                                    <p className={`mb-4 ${isDark ? 'text-blue-300' : 'text-red-500'} fw-bold`}>Fundado por Tito Perez Ponce</p>

                                    {/* LA FRASE DEL ERIZO */}
                                    <div className="col-md-10 mx-auto mb-5">
                                        <div className={`p-4 rounded-3xl position-relative ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                                            <span className="display-1 position-absolute top-0 start-0 ms-3 opacity-10" style={{ lineHeight: 0, fontFamily: 'serif' }}>“</span>
                                            <p className="fs-5 fst-italic mb-0" style={{ lineHeight: '1.6' }}>
                                                "Aunque los erizos tenemos fama de ser 'picudos', mi compromiso es dejar las espinas afuera y ponerle todo el corazón a tu comida, para ofrecerte un servicio suave y delicioso."
                                            </p>
                                        </div>
                                    </div>

                                    {/* VALORES */}
                                    <div className="row g-4 justify-content-center text-start">
                                        <div className="col-md-4">
                                            <div className={`p-3 rounded-xl h-100 ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                                                <Award className="text-warning mb-2" size={32} />
                                                <h5 className="fw-bold">Calidad</h5>
                                                <p className="small opacity-75 mb-0">Ingredientes seleccionados minuciosamente para garantizar el mejor sabor.</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className={`p-3 rounded-xl h-100 ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                                                <Clock className="text-info mb-2" size={32} />
                                                <h5 className="fw-bold">Rapidez</h5>
                                                <p className="small opacity-75 mb-0">Tu tiempo vale oro, por eso nos esforzamos en entregas eficientes.</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className={`p-3 rounded-xl h-100 ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                                                <CheckCircle className="text-success mb-2" size={32} />
                                                <h5 className="fw-bold">Confianza</h5>
                                                <p className="small opacity-75 mb-0">Un servicio transparente y honesto, porque eres parte de la familia.</p>
                                            </div>
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