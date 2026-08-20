import { apiJson } from "../../shared/utils/api";
import type { Product, ProductForm } from "./types";

export const productKeys = { all: ["products"] as const };
export const fetchProducts = () =>
  apiJson<Product[]>(
    "/api/products",
    undefined,
    "商品マスタを取得できませんでした。",
  );
export const saveProduct = ({
  id,
  form,
}: {
  id: number | null;
  form: ProductForm;
}) =>
  apiJson<Product>(
    id ? `/api/products/${id}` : "/api/products",
    {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productCode: form.productCode.trim(),
        name: form.name.trim(),
        unitPrice: Number(form.unitPrice),
        active: form.active,
      }),
    },
    "商品を保存できませんでした。",
  );
