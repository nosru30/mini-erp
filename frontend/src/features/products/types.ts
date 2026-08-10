export type Product = {
  id: number;
  productCode: string;
  name: string;
  unitPrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductForm = {
  productCode: string;
  name: string;
  unitPrice: string;
  active: boolean;
};
