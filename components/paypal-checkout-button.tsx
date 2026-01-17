"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";
import { toast } from "sonner";

interface PayPalCheckoutButtonProps {
  planId: string;
  onSuccess?: () => void;
}

export function PayPalCheckoutButton({ planId, onSuccess }: PayPalCheckoutButtonProps) {
  const [error, setError] = useState<string | null>(null);

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "USD",
    intent: "capture",
  };

  if (!initialOptions.clientId) {
    return <div className="text-red-500 text-sm">PayPal Client ID missing</div>;
  }

  return (
      <div className="w-full z-0 relative">
        <PayPalButtons
          style={{ layout: "horizontal", height: 40, tagline: false }}
          createOrder={async (data, actions) => {
            setError(null);
            try {
              const response = await fetch("/api/payment/paypal/create-order", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  planId: planId,
                }),
              });

              const orderData = await response.json();

              if (!response.ok) {
                throw new Error(orderData.message || "Failed to create order");
              }

              if (orderData.id) {
                return orderData.id;
              } else {
                 throw new Error("Order ID missing from response");
              }

            } catch (err: any) {
              console.error("PayPal Create Order Error:", err);
              setError(err.message || "Could not initiate PayPal checkout");
              toast.error("Payment initialization failed");
              // Return nothing or throw to stop the flow
              throw err;
            }
          }}
          onApprove={async (data, actions) => {
            try {
              const response = await fetch("/api/payment/paypal/capture-order", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderID: data.orderID,
                }),
              });

              const transaction = await response.json();

              if (!response.ok) {
                throw new Error(transaction.message || "Failed to capture order");
              }

              toast.success("Payment successful! Credits added.");
              if (onSuccess) onSuccess();

            } catch (err: any) {
              console.error("PayPal Capture Error:", err);
              setError(err.message || "Payment capture failed");
              toast.error("Payment failed during processing");
            }
          }}
          onError={(err: any) => {
            console.error("PayPal SDK Error:", err);
            setError("An unexpected error occurred with PayPal.");
            toast.error("PayPal encountered an error");
          }}
        />
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>
  );
}
