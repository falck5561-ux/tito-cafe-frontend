// Archivo: src/components/CheckoutForm.jsx

import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import toast from 'react-hot-toast';

function CheckoutForm({ total, handleSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (total > 0 && token) {
      axios.post('https://tito-cafe-backend.onrender.com/api/payments/create-payment-intent', 
        { amount: total },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(res => {
        setClientSecret(res.data.clientSecret);
      })
      .catch(err => {
        setError('No se pudo iniciar el proceso de pago. Intenta de nuevo.');
      });
    }
  }, [total]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required' 
    });

    if (stripeError) {
      setError(stripeError.message);
      toast.error(stripeError.message);
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success('¡Pago procesado con éxito!');
      handleSuccess();
    } else {
       setError('El pago no pudo ser procesado.');
    }
    
    setProcessing(false);
  };

  if (!clientSecret) {
    return <div className="text-center"><div className="spinner-border" role="status"></div><p>Iniciando pago...</p></div>;
  }

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