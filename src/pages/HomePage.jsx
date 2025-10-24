import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMenuData } from '../hooks/useMenuData';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { useCart } from '../context/CartContext';

function HomePage() {
  const { productos, loading, error } = useMenuData();
  const { agregarProductoAPedido } = useCart();

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
    window.location.href = '/hacer-un-pedido';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      {/* ================= HERO ================= */}
      <section className="hero-section">
        <div className="hero-hedgehog-logo-container">
          <motion.img
            src="/icon.png"
            alt="Tito Café Logo"
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
            TITO CAFETERÍA
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            El sabor de la tradición en cada taza ☕  
            Descubre nuestros cafés de especialidad y postres artesanales.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link to="/hacer-un-pedido" className="btn btn-primary btn-lg mt-3">
              Haz tu Pedido
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================= MENÚ ================= */}
      <div className="container section-padding">
        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border" role="status"></div>
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <>
            <h2 className="text-center mb-4">Nuestro Menú</h2>
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
