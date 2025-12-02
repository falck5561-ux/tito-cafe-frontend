// Archivo: src/components/CheckoutForm.jsx

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { crearPedidoAPI } from '../services/api'; 

// Recibimos 'isDark' para ajustar los estilos
function CheckoutForm({ total, datosPedido, handleSuccess, isDark }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Definimos el gradiente igual que en tu ClientePage para consistencia
  const btnGradient = isDark 
    ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' // Azul
    : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'; // Rojo

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    // ================== PASO 1: CONFIRMAR EL PAGO CON STRIPE ==================
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required' 
    });

    if (stripeError) {
      setError(stripeError.message);
      toast.error(stripeError.message, { id: 'stripe-error' });
      setProcessing(false);
      return;
    }

    // ================== PASO 2: CREAR EL PEDIDO EN TU BACKEND ==================
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        const pedidoFinal = { ...datosPedido, stripePaymentId: paymentIntent.id };

        await crearPedidoAPI(pedidoFinal);
        
        // Usamos un ID único aquí también para prevenir cualquier duplicado accidental
        toast.success('¡Pedido realizado con éxito!', { id: 'success-payment-unique' });
        
        handleSuccess(); // Cierra el modal y limpia el carrito

      } catch (apiError) {
        const errorMessage = apiError.response?.data?.msg || 'Pago exitoso, pero error al registrar pedido.';
        setError(errorMessage);
        toast.error(errorMessage, { id: 'backend-error' });
      }
    }
    
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Layout 'tabs' hace que se vea más organizado */}
      <PaymentElement options={{ layout: 'tabs' }} />
      
      <button
        disabled={processing || !stripe || !elements}
        className="btn border-0 rounded-pill w-100 mt-4 fw-bold text-white shadow-lg py-3"
        style={{ 
            background: btnGradient,
            transition: 'transform 0.2s',
            opacity: (processing || !stripe || !elements) ? 0.7 : 1
        }}
        onMouseOver={(e) => !processing && (e.currentTarget.style.transform = 'scale(1.02)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {processing ? (
            <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Procesando...
            </span>
        ) : (
            `Pagar $${total.toFixed(2)}`
        )}
      </button>
      
      {error && (
          <div className="alert alert-danger mt-3 py-2 px-3 rounded-3 small border-0 bg-red-500/10 text-red-500">
              {error}
          </div>
      )}
    </form>
  );
}

export default CheckoutForm;