import { gql } from "@apollo/client";

export const CREATE_PAYMENT_ORDER = gql`
  mutation CreatePaymentOrder($bookingId: ID!) {
    createPaymentOrder(bookingId: $bookingId) {
      paymentId
      orderId
      amount
      currency
      keyId
      bookingNumber
    }
  }
`;

export const VERIFY_RAZORPAY_PAYMENT = gql`
  mutation VerifyRazorpayPayment($input: VerifyRazorpayPaymentInput!) {
    verifyRazorpayPayment(input: $input) {
      bookingNumber
      status
      paymentStatus
      totalAmount
      currency
    }
  }
`;
