export interface FileResult {
  fileId: string;
  url: string;
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface StorageProvider {
  upload(
    file: {
      buffer: Uint8Array;
      originalname: string;
      mimetype: string;
      size: number;
    },
    destinationPath: string,
  ): Promise<FileResult>;
  download(key: string): Promise<Uint8Array>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: string;
  badge?: number;
}

export interface NotificationProvider {
  sendPush(deviceToken: string, payload: NotificationPayload): Promise<void>;
  sendEmail(to: string, subject: string, html: string): Promise<void>;
  sendSMS(phone: string, text: string): Promise<void>;
}

export interface PaymentRequest {
  orderId: string;
  invoiceId: string;
  amount: number; // In integer minor units
  currency: string;
  paymentMethod: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionRef?: string;
  amount: number;
  currency: string;
  status: string;
  rawGatewayResponse?: unknown;
}

export interface PaymentVerification {
  isValid: boolean;
  paymentId: string;
  transactionRef: string;
  amount: number;
  status: string;
}

export interface RefundRequest {
  paymentId: string;
  amount: number; // In minor units
  reason: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
}

export interface PaymentProvider {
  createPayment(req: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(params: Record<string, unknown>): Promise<PaymentVerification>;
  refundPayment(req: RefundRequest): Promise<RefundResult>;
}

export interface PrinterReceiptData {
  restaurantName: string;
  address: string;
  phone: string;
  gstin?: string;
  invoiceNumber: string;
  orderNumber: string;
  dateFormatted: string;
  tableNumber?: string;
  captainName?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  serviceCharge: number;
  grandTotal: number;
  paymentMethod: string;
  isDuplicate?: boolean;
}

export interface PrinterKOTData {
  kotNumber: string;
  orderNumber: string;
  stationName: string;
  tableNumber?: string;
  orderType: string;
  captainName?: string;
  timeFormatted: string;
  priority: string;
  notes?: string;
  items: Array<{
    name: string;
    quantity: number;
    variant?: string;
    modifiers?: string[];
    notes?: string;
  }>;
}

export interface PrinterProvider {
  printReceipt(receipt: PrinterReceiptData, printerUri: string): Promise<void>;
  printKOT(kot: PrinterKOTData, printerUri: string): Promise<void>;
  openCashDrawer(printerUri: string): Promise<void>;
}

export interface AuthResult {
  userId: string;
  username: string;
  email?: string;
  role: string;
  permissions: string[];
  accessToken: string;
  refreshToken: string;
}

export interface TokenResult {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticationProvider {
  authenticate(credentials: {
    username: string;
    password?: string;
    pin?: string;
  }): Promise<AuthResult>;
  refreshToken(token: string): Promise<TokenResult>;
  revokeToken(token: string): Promise<void>;
}
