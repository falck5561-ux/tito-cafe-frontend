import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

function ProductCard({ product, index, onCardClick }) {
  const precioConDescuento = Number(product.precio) * (1 - (product.descuento_porcentaje || 0) / 100);
  
  // =======================================================
  // === ¡AQUÍ ESTÁ LA CORRECCIÓN DEFINITIVA! ===
  // =======================================================
  // 1. Buscamos la URL en 'product.imagen_url' que viene de la base de datos.
  // 2. Si existe, la convertimos en un arreglo de una sola imagen para que el resto del código funcione.
  const images = product.imagen_url ? [product.imagen_url] : [];
  const hasImages = images.length > 0;
  // La lógica de 'hasMultipleImages' seguirá funcionando si en el futuro decides soportar más de una.
  const hasMultipleImages = images.length > 1;

  const getPlaceholderImage = (categoria) => {
    const cat = categoria?.toLowerCase() || '';
    if (cat.includes('caliente') || cat.includes('café')) return '/placeholder-cafe.jpg';
    if (cat.includes('fría')) return '/placeholder-fria.jpg';
    if (cat.includes('postre') || cat.includes('pastel')) return '/placeholder-postre.jpg';
    return '/placeholder-cafe.jpg'; // Imagen por defecto
  };

  return (
    <motion.div 
      key={product.id} 
      className="col" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.05 }}
    >
      <div 
        className={`card h-100 shadow-sm position-relative ${product.en_oferta ? 'en-oferta' : ''}`}
        onClick={() => onCardClick(product)}
        style={{ cursor: 'pointer' }}
      >
        {product.en_oferta && (<span className="discount-badge">-{product.descuento_porcentaje}%</span>)}
        
        {/* El resto del código ya no necesita cambios, porque ahora 'images' tendrá la URL correcta */}
        {hasMultipleImages ? (
          <Swiper modules={[Navigation, Pagination]} spaceBetween={0} slidesPerView={1} navigation pagination={{ clickable: true }} className="card-img-top" style={{ height: '200px' }}>
            {images.map((url, i) => (<SwiperSlide key={i}><img src={url} className="img-fluid" alt={`${product.nombre} ${i + 1}`} style={{ height: '200px', width: '100%', objectFit: 'cover' }} /></SwiperSlide>))}
          </Swiper>
        ) : (
          <img src={hasImages ? images[0] : getPlaceholderImage(product.categoria)} className="card-img-top" alt={product.nombre} style={{ height: '200px', objectFit: 'cover' }} />
        )}
        
        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-center flex-grow-1">{product.nombre}</h5>
        </div>
        
        <div className="card-footer bg-transparent border-top-0 pb-3 text-center">
          {product.en_oferta && product.descuento_porcentaje > 0 ? (
            <div>
              <span className="text-muted text-decoration-line-through me-2">${Number(product.precio).toFixed(2)}</span>
              <span className="fw-bold fs-5" style={{color: '#28a745'}}>${precioConDescuento.toFixed(2)}</span>
            </div>
          ) : (<span className="fw-bold fs-5">${Number(product.precio).toFixed(2)}</span>)}
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;