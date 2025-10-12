import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMenuData } from '../hooks/useMenuData';
import ProductCard from '../components/ProductCard';
import ComboSlide from '../components/ComboSlide';

// --- IMPORTANTE: Asegúrate de que estas importaciones de CSS estén aquí ---
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Swiper } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

function HomePage() {
  const { productos, combos, loading, error, user, getPedidoUrl } = useMenuData();

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
        <Link to={getPedidoUrl()} className="btn btn-primary btn-lg mt-3">Haz tu Pedido</Link>
      </div>

      {loading && <div className="text-center my-5"><div className="spinner-border" style={{ width: '3rem', height: '3rem' }} role="status"></div></div>}
      {error && <div className="alert alert-danger container">{error}</div>}
      
      {!loading && !error && (
        <div>
            {combos.length > 0 && (
              <div className="container section-padding">
                <h2 className="text-center">Combos Especiales</h2>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={30} slidesPerView={1} navigation pagination={{ clickable: true }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }} loop={true}
                    className="shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}
                >
                    {combos.map((combo) => (
                      <ComboSlide key={combo.id} combo={combo} getPedidoUrl={getPedidoUrl} />
                    ))}
                </Swiper>
              </div>
            )}

            <div className="container text-center section-padding">
              <h2 className="text-center">El Corazón de Tito Café</h2>
              <p className="lead" style={{ maxWidth: '700px', margin: '0 auto' }}>
                En Tito Café, cada grano cuenta una historia...
              </p>
            </div>

            <div className="parallax-section"></div>

            <div className="container section-padding">
              <h2 className="text-center">Nuestro Menú</h2>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {productos.map((producto, index) => (
                  <ProductCard key={producto.id} product={producto} index={index} />
                ))}
              </div>
            </div>
        </div>
      )}
    </motion.div>
  );
}
export default HomePage;