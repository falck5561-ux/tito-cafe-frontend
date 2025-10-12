import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

function ProductCard({ product, index }) {
  const precioConDescuento = Number(product.precio) * (1 - product.descuento_porcentaje / 100);
  const hasImages = product.imagenes && product.imagenes.length > 0;
  const hasMultipleImages = hasImages && product.imagenes.length > 1;

  // --- FUNCIÓN ACTUALIZADA CON IMÁGENES LOCALES ---
  const getPlaceholderImage = (categoria) => {
    const cat = categoria?.toLowerCase() || '';
    if (cat.includes('caliente') || cat.includes('café')) return '/placeholder-cafe.jpg';
    if (cat.includes('fría')) return '/placeholder-fria.jpg';
    if (cat.includes('postre') || cat.includes('pastel')) return '/placeholder-postre.jpg';
    return '/placeholder-cafe.jpg';
  };

  return (
    <motion.div key={product.id} className="col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <div className={`card h-100 shadow-sm position-relative ${product.en_oferta ? 'en-oferta' : ''}`}>
        {product.en_oferta && (<span className="discount-badge">-{product.descuento_porcentaje}%</span>)}
        {hasMultipleImages ? (
          <Swiper modules={[Navigation, Pagination]} spaceBetween={0} slidesPerView={1} navigation pagination={{ clickable: true }} className="card-img-top" style={{ height: '200px' }}>
            {product.imagenes.map((url, i) => (<SwiperSlide key={i}><img src={url} className="img-fluid" alt={`${product.nombre} ${i + 1}`} style={{ height: '200px', width: '100%', objectFit: 'cover' }} /></SwiperSlide>))}
          </Swiper>
        ) : (<img src={hasImages ? product.imagenes[0] : getPlaceholderImage(product.categoria)} className="card-img-top" alt={product.nombre} style={{ height: '200px', objectFit: 'cover' }} />)}
        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-center flex-grow-1">{product.nombre}</h5>
        </div>
        <div className="card-footer bg-transparent border-top-0 pb-3 text-center">
          {product.en_oferta && product.descuento_porcentaje > 0 ? (
            <div>
              <span className="text-muted text-decoration-line-through me-2">${Number(product.precio).toFixed(2)}</span>
              <span className="fw-bold fs-5" style={{color: '#28a745'}}>${precioConDescuento.toFixed(2)}</span>
            </div>
          ) : (<span className="fw-bold fs-5" style={{color: '#28a745'}}>${Number(product.precio).toFixed(2)}</span>)}
        </div>
      </div>                    
    </motion.div>
  );
}
export default ProductCard;