export interface Customer {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  bookId: number;
  title: string;
  author?: string | null;
  imageUrl?: string | null;
  price: number;
  quantity: number;
}

export interface Order {
  id?: number;
  confirmationNumber: string;
  date: string | Date;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  surcharge: number;
  total: number;
}
