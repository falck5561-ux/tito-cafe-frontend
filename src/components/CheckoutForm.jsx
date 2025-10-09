// Archivo: src/components/CheckoutForm.jsx (Versión Simplificada)

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

function CheckoutForm({ total, handleSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required' 
    });

    if (stripeError) {
      setError(stripeError.message);
      toast.error(stripeError.message);
      setProcessing(false);
      return;
    }

    // Si no hubo error, el pago fue exitoso
    toast.success('¡Pago procesado con éxito!');
    handleSuccess();
    
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        disabled={processing || !stripe || !elements}
        className="btn btn-primary w-100 mt-4"
      >
        {processing ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
      </button>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </form>
  );
}

export default CheckoutForm;