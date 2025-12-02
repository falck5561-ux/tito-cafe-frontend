import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMenuData } from '../hooks/useMenuData';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { useCart } from '../context/CartContext';
// Importamos iconos para la sección de Nosotros
import { Award, Clock, CheckCircle } from 'lucide-react';

function HomePage() {
  const { productos, loading, error } = useMenuData();
  const { agregarProductoAPedido } = useCart();
  const navigate = useNavigate();

  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);

  const handleShowDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
  };

  const handleAddToCartAndNavigate = (product) => {
    agregarProductoAPedido(product);
    handleCloseDetails();
    navigate('/hacer-un-pedido');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      
      {/* ================= HERO (PORTADA) ================= */}
      <section className="hero-section">
        <div className="hero-hedgehog-logo-container">
          <motion.img
            src="/icon.png" 
            alt="Tito Café Logo Erizo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        </div>

        {/* Texto del Hero */}
        <div className="hero-text-content">
          <motion.h1
            className="hero-title"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            TITO SPOT
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Tu punto de sabor
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link to="/hacer-un-pedido" className="btn btn-primary btn-lg mt-3 rounded-pill px-5 shadow-lg fw-bold">
              Haz tu Pedido
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================= SECCIÓN: SOBRE NOSOTROS (FUNDADOR) ================= */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              
              {/* FOTO DEL JEFE */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="d-inline-block position-relative mb-4"
              >
                <img 
                    src="/titojefe.png" 
                    alt="Tito Perez Ponce" 
                    className="rounded-circle shadow-lg object-cover border border-4 border-white"
                    style={{ width: '160px', height: '160px', objectFit: 'cover' }}
                />
                <div className="position-absolute bottom-0 end-0 p-2 rounded-circle bg-success border border-4 border-white"></div>
              </motion.div>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h2 className="fw-bold mb-2 text-dark">Sobre Nosotros</h2>
                <div className="d-inline-block px-3 py-1 rounded-pill mb-4 bg-primary bg-opacity-10 text-primary fw-bold small">
                    Fundado por Tito Perez Ponce
                </div>

                <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                    <p className="fst-italic text-muted mb-0 lead">
                        "Aunque los erizos tenemos fama de ser 'picudos', mi compromiso es dejar las espinas afuera y ponerle todo el corazón a tu comida, para ofrecerte un servicio suave y delicioso."
                    </p>
                </div>

                {/* VALORES */}
                <div className="row mt-5 g-4 justify-content-center">
                    {[
                        { icon: <Award size={32} />, title: "Calidad", desc: "Ingredientes frescos" },
                        { icon: <Clock size={32} />, title: "Rapidez", desc: "Entrega eficiente" },
                        { icon: <CheckCircle size={32} />, title: "Confianza", desc: "Sabor garantizado" }
                    ].map((val, i) => (
                        <div key={i} className="col-4">
                            <div className="d-flex flex-column align-items-center gap-2 text-dark">
                                <div className="p-3 rounded-circle bg-light text-primary mb-1">
                                    {val.icon}
                                </div>
                                <div className="fw-bold small">{val.title}</div>
                            </div>
                        </div>
                    ))}
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* ================= MENÚ ================= */}
      <div className="container section-padding py-5">
        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <>
            <h2 className="text-center mb-5 fw-bold display-6">Nuestro Menú Favorito</h2>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {productos.map((producto, index) => (
                <ProductCard
                  key={producto.id}
                  product={producto}
                  index={index}
                  onCardClick={handleShowDetails}
                />
              ))}
            </div>
            
            <div className="text-center mt-5">
                <Link to="/hacer-un-pedido" className="btn btn-outline-primary rounded-pill px-4 py-2">
                    Ver Menú Completo
                </Link>
            </div>
          </>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showDetailModal && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseDetails}
          onAddToCart={handleAddToCartAndNavigate}
        />
      )}
    </motion.div>
  );
}

export default HomePage;