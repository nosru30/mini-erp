import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { ApiErrors } from "../../shared/types";
import { apiFetch, readError } from "../../shared/utils/api";
import type { Product, ProductForm } from "./types";

const initialForm: ProductForm = {
  productCode: "",
  name: "",
  unitPrice: "",
  active: true,
};

export function useProducts(
  query: string,
  showNotice: (message: string) => void,
  enabled: boolean,
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadingRef = useRef(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<ApiErrors>({});
  const [form, setForm] = useState(initialForm);

  const loadProducts = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadError("");
    try {
      const response = await apiFetch("/api/products");
      if (!response.ok) throw new Error("商品マスタを取得できませんでした。");
      setProducts((await response.json()) as Product[]);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "商品マスタを取得できませんでした。",
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled && !hasLoaded) void loadProducts();
  }, [enabled, hasLoaded, loadProducts]);

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
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setFormErrors({});
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormErrors({});
    try {
      const response = await apiFetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productCode: form.productCode.trim(),
            name: form.name.trim(),
            unitPrice: Number(form.unitPrice),
            active: form.active,
          }),
        },
      );
      if (!response.ok) {
        setFormErrors(await readError(response));
        return;
      }
      const saved = (await response.json()) as Product;
      setProducts((current) =>
        editingId
          ? current.map((product) =>
              product.id === saved.id ? saved : product,
            )
          : [...current, saved],
      );
      setFormOpen(false);
      setEditingId(null);
      showNotice(
        `商品「${saved.name}」を${editingId ? "更新" : "登録"}しました。`,
      );
    } catch {
      setFormErrors({ form: "サーバーに接続できませんでした。" });
    } finally {
      setSaving(false);
    }
  };

  return {
    products,
    filteredProducts,
    loading: loading || (enabled && !hasLoaded && !loadError),
    loadError,
    loadProducts,
    formOpen,
    editing: editingId !== null,
    saving,
    formErrors,
    form,
    setForm,
    openNew,
    openEdit,
    closeForm,
    submit,
  };
}
