import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import type { ApiErrors } from "../../shared/types";
import { ApiError } from "../../shared/utils/api";
import { fetchProducts, productKeys, saveProduct } from "./api";
import type { Product, ProductForm } from "./types";

const initialForm: ProductForm = {
  productCode: "",
  name: "",
  unitPrice: "",
  active: true,
};
const emptyProducts: Product[] = [];

export function useProducts(
  query: string,
  showNotice: (message: string) => void,
  enabled: boolean,
) {
  const queryClient = useQueryClient();
  const productsQuery = useQuery({
    queryKey: productKeys.all,
    queryFn: fetchProducts,
    enabled,
  });
  const products = productsQuery.data ?? emptyProducts;
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<ApiErrors>({});
  const [form, setForm] = useState(initialForm);
  const saveMutation = useMutation({
    mutationFn: saveProduct,
    onSuccess: (saved, variables) => {
      queryClient.setQueryData<Product[]>(productKeys.all, (current = []) =>
        variables.id
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved],
      );
      setFormOpen(false);
      setEditingId(null);
      showNotice(
        `商品「${saved.name}」を${variables.id ? "更新" : "登録"}しました。`,
      );
    },
    onError: (error) =>
      setFormErrors(
        error instanceof ApiError
          ? error.fields
          : { form: "サーバーに接続できませんでした。" },
      ),
  });
  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    return normalized
      ? products.filter((product) =>
          `${product.productCode} ${product.name}`
            .toLocaleLowerCase("ja")
            .includes(normalized),
        )
      : products;
  }, [products, query]);
  const openNew = () => {
    setEditingId(null);
    setForm(initialForm);
    setFormErrors({});
    setFormOpen(true);
  };
  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      productCode: product.productCode,
      name: product.name,
      unitPrice: String(product.unitPrice),
      active: product.active,
    });
    setFormErrors({});
    setFormOpen(true);
  };
  const closeForm = () => {
    if (!saveMutation.isPending) {
      setFormOpen(false);
      setEditingId(null);
      setFormErrors({});
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setFormErrors({});
    saveMutation.mutate({ id: editingId, form });
  };
  return {
    products,
    filteredProducts,
    loading: enabled && productsQuery.isPending,
    loadError:
      productsQuery.error instanceof Error ? productsQuery.error.message : "",
    loadProducts: productsQuery.refetch,
    formOpen,
    editing: editingId !== null,
    saving: saveMutation.isPending,
    formErrors,
    form,
    setForm,
    openNew,
    openEdit,
    closeForm,
    submit,
  };
}
