import type { Product } from "../types/Product";

export type ProductCategory =
  | "Setups"
  | "Notebooks"
  | "Periféricos"
  | "Consoles"
  | "Acessórios"
  | "Monitores"
  | "Realidade VR"
  | "Áudio";

export type ProductCollectionType =
  | "maisVendidos"
  | "recomendados"
  | "emPromocao";

interface ProductCollectionOptions {
  products: Product[];
  categoria?: ProductCategory;
  tipoSessao?: ProductCollectionType;
  titulo?: string;
}

export function getCollectionTitle({
  categoria,
  tipoSessao,
  titulo,
}: Omit<ProductCollectionOptions, "products">) {
  if (titulo) return titulo;

  if (tipoSessao === "maisVendidos") return "Mais Vendidos";
  if (tipoSessao === "emPromocao") return "Em Promoção";
  if (tipoSessao === "recomendados") return "Recomendados";

  return categoria || "Produtos";
}

export function getCollectionProducts({
  products,
  categoria,
  tipoSessao,
}: ProductCollectionOptions) {
  if (tipoSessao) {
    switch (tipoSessao) {
      case "maisVendidos":
        return [...products].sort(
          (a, b) => (b.salesCount || 0) - (a.salesCount || 0)
        );
      case "emPromocao":
        return products.filter((product) => product.preco !== product.preco_original);
      case "recomendados": {
        const recommended = products.filter(
          (product) =>
            (product.avaliacoes || 0) > 1 && (product.mediaAvaliacao || 0) >= 4
        );
        return recommended.length > 0 ? recommended : products;
      }
      default:
        return products;
    }
  }

  if (categoria) {
    return products.filter((product) => product.categoria === categoria);
  }

  return products;
}
