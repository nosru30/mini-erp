export type Customer = {
  id: number;
  customerCode: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomerForm = {
  customerCode: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
};
