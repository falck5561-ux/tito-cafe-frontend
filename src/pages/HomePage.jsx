import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMenuData } from '../hooks/useMenuData';
import ProductCard from '../components/ProductCard';
import AuthContext from '../context/AuthContext';
import ProductDetailModal from '../components/ProductDetailModal'; // Importar el modal

function HomePage() {
  const { productos, loading, error } = useMenuData();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados para manejar el modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Funciones para abrir/cerrar el modal
  const handleShowDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
  };

  // Función para determinar a dónde ir al hacer clic en "Hacer Pedido"
  const handleGoToOrder = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    switch (user.rol) {
      case 'Cliente': navigate("/cliente"); break;
      case 'Jefe': navigate("/admin"); break;
      case 'Empleado': navigate("/pos"); break;
      default: navigate("/login"); break;
    }
  };

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071')`,
    backgroundSize: 'cover', backgroundPosition: 'center', color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="p-5 mb-5 text-center rounded-3 shadow" style={heroStyle}>
        <motion.img src="/logo-inicio.png" alt="Tito Café Logo" className="hero-logo mb-4" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }} />
        <h1 className="display-4 fw-bold">El Sabor de la Tradición en cada Taza</h1>
        <p className="fs-4">Descubre nuestra selección de cafés de especialidad, postres artesanales y un ambiente único.</p>
        <button onClick={handleGoToOrder} className="btn btn-primary btn-lg mt-3">Haz tu Pedido</button>
      </div>

      {loading && <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>}
      {error && <div className="alert alert-danger container">{error}</div>}
      
      {!loading && !error && (
        <div className="container section-padding">
          <h2 className="text-center">Nuestro Menú</h2>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {productos.map((producto, index) => (
              <ProductCard 
                key={producto.id} 
                product={producto} 
                index={index}
                // Le pasamos la función para que el ProductCard pueda abrir el modal
                onCardClick={handleShowDetails} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Renderizar el modal al final */}
      {showDetailModal && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseDetails}
          onAddToCart={handleGoToOrder} // El botón del modal ahora lleva a la página de pedido
        />
      )}
    </motion.div>
  );
}

export default HomePage;

