import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

function ComboCard({ combo, index }) {
  const precioConDescuento = Number(combo.precio) * (1 - combo.descuento_porcentaje / 100);
  const hasImages = combo.imagenes && combo.imagenes.length > 0;
  const hasMultipleImages = hasImages && combo.imagenes.length > 1;

  return (
    <motion.div 
      className="col" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.05 }}
    >
      <div className={`card h-100 shadow-sm position-relative ${combo.en_oferta ? 'en-oferta' : ''}`}>
        {combo.en_oferta && (<span className="discount-badge">-{combo.descuento_porcentaje}%</span>)}
        
        {hasMultipleImages ? (
          <Swiper modules={[Navigation, Pagination]} spaceBetween={0} slidesPerView={1} navigation pagination={{ clickable: true }} className="card-img-top" style={{ height: '220px' }}>
            {combo.imagenes.map((url, i) => (
              <SwiperSlide key={i}><img src={url} className="img-fluid" alt={`${combo.titulo} ${i + 1}`} style={{ height: '220px', width: '100%', objectFit: 'cover' }} /></SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <img src={hasImages ? combo.imagenes[0] : '/placeholder-postre.jpg'} className="card-img-top" alt={combo.titulo} style={{ height: '220px', objectFit: 'cover' }} />
        )}

        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-center flex-grow-1">{combo.titulo}</h5>
          <p className="card-text small text-muted text-center">{combo.descripcion}</p>
        </div>

        <div className="card-footer bg-transparent border-top-0 pb-3 text-center">
          {combo.en_oferta && combo.descuento_porcentaje > 0 ? (
            <div>
              <span className="text-muted text-decoration-line-through me-2">${Number(combo.precio).toFixed(2)}</span>
              <span className="fw-bold fs-5" style={{color: '#28a745'}}>${precioConDescuento.toFixed(2)}</span>
            </div>
          ) : (
            <span className="fw-bold fs-5" style={{color: '#28a745'}}>${Number(combo.precio).toFixed(2)}</span>
          )}
        </div>
      </div>                    
    </motion.div>
  );
}

export default ComboCard;