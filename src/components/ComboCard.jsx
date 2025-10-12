import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';

function ComboCard({ combo, index }) {
  const precioConDescuento = Number(combo.precio) * (1 - combo.descuento_porcentaje / 100);

  return (
    <motion.div 
      className="col" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.05 }}
    >
      <div className={`combo-card ${combo.en_oferta ? 'en-oferta' : ''}`}>
        <div className="combo-card-image-wrapper">
          {combo.en_oferta && (<span className="discount-badge">-{combo.descuento_porcentaje}%</span>)}
          <Swiper modules={[Navigation, Pagination, Autoplay]} loop={true} autoplay={{ delay: 3000 }} pagination={{ clickable: true }} navigation>
            {combo.imagenes.map((url, i) => (
              <SwiperSlide key={i}><img src={url} alt={`${combo.titulo} ${i + 1}`} /></SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="combo-card-body">
          <h3 className="combo-card-title">{combo.titulo}</h3>
          <p className="combo-card-text">{combo.descripcion}</p>
          <div className="combo-card-footer">
            {combo.en_oferta && combo.descuento_porcentaje > 0 ? (
              <div className="price-area">
                <span className="original-price">${Number(combo.precio).toFixed(2)}</span>
                <span className="discounted-price">${precioConDescuento.toFixed(2)}</span>
              </div>
            ) : (
              <div className="price-area">
                <span className="discounted-price">${Number(combo.precio).toFixed(2)}</span>
              </div>
            )}
            <Link to="/cliente" className="btn btn-primary">¡Lo Quiero!</Link>
          </div>
        </div>
      </div>                    
    </motion.div>
  );
}
export default ComboCard;