// Archivo: src/components/CheckoutForm.jsx
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import toast from 'react-hot-toast';

function CheckoutForm({ total, handleSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      // 1. Pide el client_secret a nuestro backend
      const { data: { clientSecret } } = await axios.post('https://tito-cafe-backend.onrender.com/api/payment/create-payment-intent', { total });

      // 2. Confirma el pago con Stripe usando el client_secret
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // 3. Si el pago fue exitoso, llama a la función de éxito
      if (paymentIntent.status === 'succeeded') {
        toast.success('¡Pago realizado con éxito!');
        handleSuccess(); // Esta función registrará el pedido en nuestra DB
      }
    } catch (err) {
      toast.error('Ocurrió un error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4 className="mb-3">Datos de la Tarjeta</h4>
      <CardElement className="form-control p-3" />
      <button type="submit" className="btn btn-primary w-100 mt-4" disabled={!stripe || loading}>
        {loading ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default CheckoutForm;