export interface ReservationItem {
  ticketTypeId: string;
  ticketName: string;
  quantity: number;
  unitPrice: number;
}

export interface BookingItem extends ReservationItem {
  totalPrice: number;
}

export interface Reservation {
  id: string;
  eventId: string;
  status: string;
  expiresAt: string;
  items: ReservationItem[];
}

export interface Booking {
  id: string;
  eventId: string;
  reservationId: string;
  bookingNumber: string;
  items: BookingItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
}

export interface ReservationPayload {
  reservation: Reservation;
  booking: Booking;
}

export interface BookingSummaryState {
  reservation: Reservation;
  booking: Booking;
  eventTitle?: string;
}

export interface BookingWithReservation extends Booking {
  reservation: Reservation;
}
