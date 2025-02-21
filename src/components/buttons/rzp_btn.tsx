import { SERVER_ERROR } from '@/config/errors';
import postHandler from '@/handlers/post_handler';
import { addCredits, setSubscription, userSelector } from '@/slices/userSlice';
import Toaster from '@/utils/toaster';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionProps {
  subscription: string;
  title?: string;
}

export const RazorpaySubscriptionButton = ({ subscription, title }: SubscriptionProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchOrderData = async () => {
    const URL = `subscriptions`;
    const res = await postHandler(URL, { type: subscription });
    if (res.statusCode == 200) {
      return res.data.subscriptionID;
    } else {
      Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
    }
  };

  const user = useSelector(userSelector);
  const dispatch = useDispatch();

  const handlePayment = async () => {
    const subscriptionID = await fetchOrderData();

    if (!subscriptionID) return;

    const options = {
      key: process.env.NEXT_PUBLIC_RZP_KEY,
      currency: 'INR',
      name: 'Interact',
      description: '',
      image: 'https://mailer.interactnow.in/logo.png',
      subscription_id: subscriptionID,
      handler: function () {
        dispatch(setSubscription(subscription));
        Toaster.success('Payment Successful!');
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phoneNo,
      },
      modal: {
        confirm_close: true,
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response: any) {
      Toaster.error(response.error.reason);
    });

    rzp1.open();
  };

  return (
    <button
      onClick={handlePayment}
      className="w-40 text-lg bg-slate-100 border-2 text-black border-[#1f1f1f] hover:text-white py-1 rounded-xl hover:bg-[#1f1f1f] animate-fade_third disabled:opacity-50 disabled:cursor-default transition-ease-200"
    >
      {title || 'Pay Now'}
    </button>
  );
};

interface PaymentProps {
  planID: string;
  amount: number;
  credits: number;
  title?: string;
}

export const RazorpayPaymentButton = ({ planID, amount, credits, title }: PaymentProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const user = useSelector(userSelector);
  const dispatch = useDispatch();

  const createOrder = async () => {
    const URL = `/subscriptions/order`;
    const res = await postHandler(URL, { planID });
    if (res.statusCode == 201) {
      return res.data.orderID;
    } else {
      Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
    }
  };

  const validatePayment = async ({
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  }: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    const URL = `subscriptions/order/validate`;
    const res = await postHandler(URL, {
      razorpayPaymentID: razorpay_payment_id,
      razorpayOrderID: razorpay_order_id,
      razorpaySignature: razorpay_signature,
    });
    if (res.statusCode == 200) {
      return true;
    } else {
      Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
      return false;
    }
  };

  const handlePayment = async () => {
    const orderID = await createOrder();
    if (!orderID) {
      Toaster.error('Error creating your order, please try again later.');
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RZP_KEY,
      order_id: orderID,
      amount: amount,
      currency: 'INR',
      name: 'Interact',
      description: '',
      image: 'https://mailer.interactnow.in/logo.png',
      handler: async function (response: any) {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

        const paymentValidation = await validatePayment({
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
        });

        if (paymentValidation) {
          dispatch(addCredits(credits));
          Toaster.success('Payment Successful!');
        } else {
          Toaster.error('Payment Validation Error. Please try again later.');
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phoneNo,
      },
      modal: {
        confirm_close: true,
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response: any) {
      alert(response.error.code);
      alert(response.error.description);
      alert(response.error.source);
      alert(response.error.step);
      alert(response.error.reason);
      alert(response.error.metadata.order_id);
      alert(response.error.metadata.payment_id);
    });

    rzp1.open();
  };

  return (
    <button
      onClick={handlePayment}
      className="w-40 text-lg bg-slate-100 border-2 text-black border-[#1f1f1f] hover:text-white py-1 rounded-xl hover:bg-[#1f1f1f] animate-fade_third disabled:opacity-50 disabled:cursor-default transition-ease-200"
    >
      {title || 'Pay Now'}
    </button>
  );
};
