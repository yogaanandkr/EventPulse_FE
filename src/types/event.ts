export interface Venue {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  startDate: string;
  endDate: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  venue: Venue;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  availableQuantity: number;
  saleStartDate?: string | null;
  saleEndDate?: string | null;
  status: "ACTIVE" | "INACTIVE";
}
