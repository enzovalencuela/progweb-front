/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Produtos from "../../components/Produtos/Produtos";
import BackButton from "../../components/BackButton/BackButton";
import SpanMessage from "../../components/SpanMessage/SpanMessage";
import Loading from "../../components/Loading/Loading";
import type { Product } from "../../types/Product";
import { useProduct } from "../../contexts/ProductContext";
import { fetchProductByIdCached } from "../../utils/productCache";

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorMessage, setsShowErrorMessage] = useState(false);
  const [showOkMessage, setsShowOkMessage] = useState(false);
  const { user, cart, addToCart, removeFromCart } = useAuth();
  const { setSearchQuery, setProdutos } = useProduct();
  const navigate = useNavigate();

  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const okMessage = "Operação realizada com sucesso.";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) {
          throw new Error("Produto inválido.");
        }

        const data = await fetchProductByIdCached(VITE_BACKEND_URL, Number(id));
        setProduct(data);
      } catch (err) {
        console.error("Erro ao buscar produto:", err);
        setError("Não foi possível carregar o produto. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, VITE_BACKEND_URL]);

  useEffect(() => {
    setIsAddedToCart(
      product ? cart.some((item) => item.id === product.id) : false
    );
  }, [cart, product]);

  const handleAddToCart = async () => {
    if (!user) {
      setsShowErrorMessage(true);
      return;
    }

    if (product) {
      try {
        const status = await addToCart(product);
        if (status === "ok") {
          setsShowOkMessage(true);
          return;
        }
        setsShowErrorMessage(true);
      } catch (requestError) {
        console.error("Erro ao adicionar produto:", requestError);
        setsShowErrorMessage(true);
      }
    }
  };

  const handleRemoveFromCart = async () => {
    if (!user || !product) return;

    try {
      await removeFromCart(product.id);
      setsShowOkMessage(true);
    } catch (requestError) {
      console.error("Erro ao remover produto:", requestError);
      setsShowErrorMessage(true);
    }
  };

  if (loading) {
    return <Loading variant="products" />;
  }

  if (error || !product) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "70vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BackButton />
        {error}
      </div>
    );
  }

  const parcela =
    (product.preco / product.max_parcelas) * (1 + product.taxa_parcela / 100);

  const guarantees = [
    {
      icon: ShieldCheck,
      title: "Garantia premium",
      description:
        "Apresentação clara das condições e mais confiança no checkout.",
    },
    {
      icon: Truck,
      title: "Entrega monitorada",
      description:
        "Comunicação pensada para reduzir fricção e ansiedade do cliente.",
    },
    {
      icon: BadgeCheck,
      title: "Curadoria validada",
      description:
        "Seleção com ênfase em desempenho, design e percepção de valor.",
    },
  ];

  const mobileActionLabel = isAddedToCart
    ? "Ir para o carrinho"
    : "Adicionar ao carrinho";

  return (
    <div className="space-y-10 px-4 py-4 pb-32 sm:px-6 lg:px-8 lg:pb-4">
      {showErrorMessage && (
        <ErrorMessage onClose={() => setsShowErrorMessage(false)} />
      )}
      {showOkMessage && <SpanMessage message={okMessage} status="ok" />}
      <div className="flex items-center justify-between">
        <BackButton />
      </div>
      <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[30px] bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                <Sparkles className="h-3 w-3" />
                Destaque
              </span>
              {product.preco_original && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-900">
                  Oferta especial
                </span>
              )}
            </div>
            <div className="flex aspect-square min-h-[280px] items-center justify-center sm:min-h-[420px]">
              <img
                src={product.img}
                alt={product.titulo}
                loading="eager"
                decoding="async"
                width={720}
                height={720}
                className="max-h-[420px] w-full object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-8">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                {product.categoria}
              </p>
              <h1 className="font-display text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                {product.titulo}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                {product.descricao}
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="space-y-2">
                {product.preco_original && (
                  <span className="text-sm text-slate-400 line-through">
                    De R$ {product.preco_original}
                  </span>
                )}
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-950">
                  R$ {product.preco}
                </h2>
              </div>
              <span className="mt-2 block text-sm text-slate-600">
                em até{" "}
                <b className="text-slate-900">
                  {product.max_parcelas}x de R$ {Number(parcela).toFixed(2)}
                </b>{" "}
                com taxa estimada de {product.taxa_parcela}%
              </span>
              <div className="mt-6 hidden space-y-3 lg:block">
                {!isAddedToCart ? (
                  <button
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Adicionar ao carrinho
                  </button>
                ) : (
                  <>
                    <button
                      className="min-h-12 w-full rounded-full bg-slate-200 px-5 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-300 active:scale-[0.98]"
                      onClick={handleRemoveFromCart}
                    >
                      Remover do carrinho
                    </button>
                    <button
                      className="min-h-12 w-full rounded-full bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
                      onClick={() => navigate("/carrinho")}
                    >
                      Ir para o carrinho
                    </button>
                  </>
                )}
                {user?.role === "admin" && (
                  <button
                    className="min-h-12 w-full rounded-full border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 active:scale-[0.98]"
                    onClick={() => {
                      setProdutos(true);
                      navigate("/dashboard");
                      setSearchQuery(product.id);
                    }}
                  >
                    Ver no Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {guarantees.map((item) => (
          <div
            key={item.title}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <item.icon className="mb-4 h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-950">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {item.description}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Descrição detalhada
        </p>
        <h3 className="font-display text-2xl font-semibold text-slate-950">
          O que esperar deste produto
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {(product.descricao || "")
            .split(".")
            .map((sentence) => sentence.trim())
            .filter(Boolean)
            .map((sentence, index) => (
              <div
                key={`${sentence}-${index}`}
                className="rounded-[24px] bg-slate-50 p-5"
              >
                <p className="text-sm leading-7 text-slate-700">{sentence}.</p>
              </div>
            ))}
        </div>
      </section>

      <section>
        <Produtos
          categoria={product.categoria as never}
          titulo="Produtos Relacionados"
        />
      </section>

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {product.categoria}
            </p>
            <p className="text-lg font-extrabold text-slate-950">
              R$ {product.preco}
            </p>
          </div>
          <button
            className="ml-auto flex min-h-12 min-w-[180px] items-center justify-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition active:scale-[0.98]"
            onClick={() =>
              isAddedToCart ? navigate("/carrinho") : handleAddToCart()
            }
          >
            <ShoppingBag className="h-4 w-4" />
            {mobileActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
