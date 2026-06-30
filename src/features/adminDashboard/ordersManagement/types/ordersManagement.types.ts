export interface OrderBookGenre {
  _id: string;
  title: string;
}

export interface OrderBook {
  _id: string;
  title: string;
  description?: string;
  author?: string;
  genre?: OrderBookGenre;
  price?: number;
  language?: string;
  publisher?: string;
  publicationYear?: number;
  coverImage?: {
    public_id?: string;
    url?: string;
    secure_url?: string;
  };
}

export interface OrderEBook {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  author?: string;
  formatType?: string;
  category?: string;
  price?: number;
  coverImage?: {
    public_id?: string;
    url?: string;
    secure_url?: string;
  };
  file?: {
    public_id?: string;
    url?: string;
    fileSize?: string;
  };
}

export interface OrderItem {
  productType: "book" | "ebook";
  book?: OrderBook | null;
  ebook?: OrderEBook | null;
  price: number;
  quantity: number;
}

export interface OrderUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  image?: {
    public_id: string;
    url: string;
  };
}

export interface Order {
  _id: string;
  userId: OrderUser | null;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "cancelled";
  stripeSessionId?: string;
  transactionId?: string;
  paypalOrderId?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface OrdersMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface OrdersResponseData {
  data: Order[];
  meta: OrdersMeta;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: OrdersResponseData;
}

export interface OrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: "pending" | "paid" | "cancelled" | "all";
  sort?: "ascending" | "descending";
  from?: string;
  to?: string;
}
