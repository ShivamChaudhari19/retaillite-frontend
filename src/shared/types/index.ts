/* ============================================
   Authentication & User Management
   ============================================ */

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  username: string;
  role: string[];
  token: string;
}

export interface UserRequest {
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface UserResponse {
  userId: string;
  name: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/* ============================================
   Categories
   ============================================ */

export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface CategoryResponse {
  categoryId: string;
  name: string;
  description?: string;
  imgUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/* ============================================
   Products
   ============================================ */

export interface ProductRequest {
  name: string;
  price: number;
  taxRate: number;
  description?: string;
  categoryId: string;
}

export interface ProductResponse {
  productId: string;
  name: string;
  price: number;
  taxRate: number;
  description?: string;
  imgUrl?: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

/* ============================================
   Inventory
   ============================================ */

export interface StockUpdateRequest {
  quantity: number;
}

export interface ThresholdUpdateRequest {
  threshold: number;
}

export interface InventoryResponse {
  inventoryId: string;
  productId: string;
  productName: string;
  availableQuantity: number;
  lowStockThreshold: number;
  updatedAt: string;
}

/* ============================================
   Invoices
   ============================================ */

export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELED';

export interface InvoiceItemRequest {
  productId: string;
  quantity: number;
}

export interface InvoiceItemResponse {
  invoiceItemId: string;
  productId: string;
  taxRate: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceRequest {
  customerName: string;
  customerNumber: string;
  customerEmail?: string;
  items: InvoiceItemRequest[];
}

export interface InvoiceResponse {
  invoiceId: string;
  userName: string;
  customerName: string;
  customerNumber: string;
  customerEmail?: string;
  subTotal: number;
  tax: number;
  grandTotal: number;
  invoiceStatus: InvoiceStatus;
  invoiceItems: InvoiceItemResponse[];
  createdAt: string;
  updatedAt: string;
}

/** Dashboard sale reports (GET /dashboard/...). The status segment is case-insensitive on the backend. */
export type SalePeriod = 'TODAY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

/* ============================================
   Payments
   ============================================ */

export type PaymentMethod = 'CASH' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED';

export interface PaymentRequest {
  invoiceId: string;
  paymentMethod: PaymentMethod;
}

export interface PaymentVerifyRequest {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}

export interface PaymentResponse {
  paymentId: string;
  invoiceId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface CashPaymentResponse extends PaymentResponse {
  paymentMethod: 'CASH';
}

export interface RazorpayPaymentResponse extends PaymentResponse {
  paymentMethod: 'ONLINE';
  gatewayOrderId: string;
  gatewayKeyId: string;
  currency: string;
}

export type PaymentResponseUnion = CashPaymentResponse | RazorpayPaymentResponse;

export interface RefundRequest {
  invoiceId: string;
}

export interface RefundResponse {
  paymentId: string;
  invoiceId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amount: number;
  createdAt: string;
}

/* ============================================
   Pagination
   ============================================ */

export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PagedModel<T> {
  content: T[];
  page: PageMetadata;
}

export type PagedUserResponse = PagedModel<UserResponse>;
export type PagedProductResponse = PagedModel<ProductResponse>;
export type PagedCategoryResponse = PagedModel<CategoryResponse>;
export type PagedInvoiceResponse = PagedModel<InvoiceResponse>;
export type PagedInventoryResponse = PagedModel<InventoryResponse>;

/* ============================================
   API Request/Response Wrappers
   ============================================ */

/** Error body returned by the backend for every failed request. */
export interface ApiError {
  error?: string;
  message?: string;
  status?: number;
  timestamp?: number;
}

/* ============================================
   Session/Auth State
   ============================================ */

export interface AuthSession {
  token: string;
  username: string;
  role: UserRole[];
  expiresAt?: number;
}
