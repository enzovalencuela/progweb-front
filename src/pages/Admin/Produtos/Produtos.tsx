import React, { useState } from "react";
import ProductForm from "../../../components/ProductForm/ProductForm";
import "./Produtos.css";

import type { Product } from "../../../types/Product";
import Loading from "../../../components/Loading/Loading";
import BackButton from "../../../components/BackButton/BackButton";
import SpanMessage from "../../../components/SpanMessage/SpanMessage";
import { Swiper, SwiperSlide } from "swiper/react";
import { useProduct } from "../../../contexts/ProductContext";
import AttentionMessage from "../../../components/AttentionMessage/AttentionMessage";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  removeCachedProduct,
  upsertCachedProduct,
} from "../../../utils/productCache";

type NewProduct = Omit<Product, "id">;

interface ProdutosDashboardProps {
  embedded?: boolean;
}

const navDepartments = [
  { id: "1", name: "Setups" },
  { id: "2", name: "Notebooks" },
  { id: "3", name: "Periféricos" },
  { id: "4", name: "Consoles" },
  { id: "5", name: "Acessórios" },
  { id: "6", name: "Monitores" },
  { id: "7", name: "Realidade VR" },
  { id: "8", name: "Áudio" },
];

const ProdutosDashboard: React.FC<ProdutosDashboardProps> = ({
  embedded = false,
}) => {
  const [showSpan, setShowSpan] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAttentionMessage, setShowAttentionMessage] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const {
    loading,
    products,
    setProducts,
    searchQuery,
    setSearchQuery,
    searchProducts,
    setSearchProducts,
  } = useProduct();

  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSave = async (productData: NewProduct) => {
    const isNew = isAdding;
    const url = isNew
      ? `${VITE_BACKEND_URL}/api/products/add`
      : `${VITE_BACKEND_URL}/api/products/${editingProduct?.id}`;
    const method = isNew ? "POST" : "PUT";

    const productWithDisponivel = {
      ...productData,
      disponivel: productData.disponivel ?? true,
    };

    try {
      const response = await fetch(`${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productWithDisponivel),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar o produto.");
      }

      const updatedProduct = await response.json();

      if (isNew) {
        setProducts((currentProducts) => [...currentProducts, updatedProduct]);
      } else {
        setProducts((currentProducts) =>
          currentProducts.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          )
        );
      }

      upsertCachedProduct(updatedProduct);

      setEditingProduct(null);
      setIsAdding(false);
      setShowSpan(true);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao remover produto.");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((p) => p.id !== productId)
      );
      removeCachedProduct(productId);
      setShowAttentionMessage(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Erro ao remover produto:", error);
    }
  };

  const filteredProducts =
    searchQuery === undefined
      ? products
      : products.filter((product) =>
          typeof searchQuery === "number"
            ? product.id === searchQuery
            : product.categoria === searchQuery || product.titulo.includes(searchQuery)
        );

  return loading ? (
    <Loading variant="dashboard" />
  ) : (
    <div className="products-container">
      {showSpan && (
        <SpanMessage message="Produto salvo com sucesso!" status="ok" />
      )}
      {!embedded && <BackButton />}
      {!embedded && <h1>Produtos</h1>}
      {showAttentionMessage && productToDelete !== null && (
        <AttentionMessage
          message="Tem certeza que deseja excluir esse produto?"
          onClose={() => {
            setShowAttentionMessage(false);
            setProductToDelete(null);
          }}
          onClick={() => handleDeleteProduct(productToDelete)}
          buttonContent="Sim!"
        />
      )}
      {isAdding ? (
        <ProductForm
          product={{} as Product}
          onSave={handleSave}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <motion.button
          onClick={() => setIsAdding(true)}
          className="add-product-btn"
          whileTap={{ scale: 0.98 }}
        >
          Adicionar Novo Produto
        </motion.button>
      )}
      <ul className="div-ul">
        <Swiper
          breakpoints={{
            0: { slidesPerView: 3 },
            660: { slidesPerView: 5 },
            950: { slidesPerView: 6 },
            1290: { slidesPerView: 8 },
          }}
        >
          {navDepartments.map((dept) => (
            <SwiperSlide key={dept.id}>
              <li
                className="li-departamento"
                onClick={() => setSearchQuery(dept.name)}
              >
                {dept.name}
              </li>
            </SwiperSlide>
          ))}
        </Swiper>
      </ul>
      {searchQuery !== undefined && (
        <div className="active-filter-tag">
          <span>{searchQuery}</span>
          <button
            onClick={() => {
              setSearchQuery(undefined);
              setTimeout(() => {
                setSearchProducts(!searchProducts);
              }, 100);
            }}
          >
            &times;
          </button>
        </div>
      )}
      {filteredProducts.length > 0 ? (
        <div className="product-list">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              className="product-item"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
            >
              <div className="product-div-info">
                <div className="product-info">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.img}
                      alt={product.titulo}
                      loading="lazy"
                      decoding="async"
                      width={160}
                      height={160}
                    />
                  </Link>
                  <div className="product-text">
                    <h3>{product.titulo}</h3>
                    <p>R$ {product.preco}</p>
                  </div>
                </div>
                <div className="product-actions">
                  <motion.button
                    onClick={() => setEditingProduct(product)}
                    whileTap={{ scale: 0.97 }}
                  >
                    Editar
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setProductToDelete(product.id);
                      setShowAttentionMessage(true);
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Remover
                  </motion.button>
                </div>
              </div>
              {editingProduct?.id === product.id && (
                <ProductForm
                  product={editingProduct}
                  onSave={handleSave}
                  onCancel={() => setEditingProduct(null)}
                />
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="empty-product-list">
          <p>sem produtos</p>
        </div>
      )}
    </div>
  );
};

export default ProdutosDashboard;
