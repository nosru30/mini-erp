export type SalesOrderStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export type SalesOrderSummary = {
  id: number;
  orderNumber: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  orderDate: string;
  status: SalesOrderStatus;
  totalAmount: number;
};

export type SalesOrderItem = {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
};

export type SalesOrderDetail = SalesOrderSummary & {
  items: SalesOrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type SavedSalesOrder = SalesOrderDetail;
