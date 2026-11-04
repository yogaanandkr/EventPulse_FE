export {};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;

    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };

    theme?: {
      color?: string;
    };

    handler: (response: RazorpayPaymentResponse) => void;
    modal?: {
      ondismiss?: () => void;
    };
  }

  interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayInstance {
    open: () => void;

    on: (
      event: "payment.failed",
      callback: (response: RazorpayFailureResponse) => void,
    ) => void;
  }

  interface RazorpayFailureResponse {
    error: {
      code: string;
      description: string;
      reason?: string;
      metadata?: {
        order_id?: string;
        payment_id?: string;
      };
    };
  }
}
