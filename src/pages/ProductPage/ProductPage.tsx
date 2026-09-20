import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../contexts/AuthContext";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Produtos from "../../components/Produtos/Produtos";
import BackButton from "../../components/BackButton/BackButton";
import SpanMessage from "../../components/SpanMessage/SpanMessage";
import Loading from "../../components/Loading/Loading";
import type { Product } from "../../types/Product";
import { useProduct } from "../../contexts/ProductContext";
import { mockProducts } from "../../mocks/products";
import { fetchProductByIdCached } from "../../utils/productCache";

interface Review {
  id: number;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  imageUrl?: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorMessage, setsShowErrorMessage] = useState(false);
  const [showOkMessage, setsShowOkMessage] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Form states para nova avaliação
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newImgUrl, setNewImgUrl] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

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

        const data =
          (await fetchProductByIdCached(VITE_BACKEND_URL, Number(id))) ||
          mockProducts.find((p) => p.id === Number(id));

        setProduct(data ?? null);
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
      product ? cart.some((item) => item.id === product.id) : false,
    );
  }, [cart, product]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        const response = await fetch(
          `${VITE_BACKEND_URL}/api/reviews/product/${id}`,
        );
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (err) {
        console.error("Erro ao carregar avaliações do banco:", err);
      }
    };

    fetchReviews();
  }, [id, VITE_BACKEND_URL]);

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

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const createdReview: Review = {
      id: Date.now(),
      userName: user?.name || user?.email?.split("@")[0] || "Cliente NexGen",
      rating: newRating,
      comment: newComment,
      imageUrl: newImgUrl || undefined,
      verifiedPurchase: true,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };

    setReviews([createdReview, ...reviews]);
    setNewComment("");
    setNewImgUrl("");
    setShowReviewForm(false);
    setsShowOkMessage(true);
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

  const totalReviewsCount = reviews.length;
  const averageRating =
    totalReviewsCount > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount
        ).toFixed(1)
      : "5.0";

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
    <div className="px-4 py-4 pb-32 sm:px-6 lg:px-8 lg:pb-4">
      {showErrorMessage && (
        <ErrorMessage onClose={() => setsShowErrorMessage(false)} />
      )}
      {showOkMessage && <SpanMessage message={okMessage} status="ok" />}
      <div className="flex items-center justify-between">
        <BackButton />
      </div>
      <div className="flex flex-col gap-10">
        {/* SESSÃO PRINCIPAL DO PRODUTO */}
        <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex flex-[3] flex-col">
              <div className="flex-row mb-4 gap-2 hidden lg:flex">
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
              <div className="flex aspect-square items-center justify-center">
                <img
                  src={product.img}
                  alt={product.titulo}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover rounded-[28px] border border-slate-200"
                />
              </div>
            </div>

            <div className="flex flex-[5] flex-col justify-between gap-8">
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {product.categoria}
                  </p>
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 border border-amber-200/60">
                    <span className="text-xs font-bold text-amber-900">
                      {averageRating}
                    </span>
                    <FontAwesomeIcon
                      icon={faStar}
                      className="h-3 w-3 text-amber-400"
                    />
                    <span className="text-xs text-slate-400">
                      ({totalReviewsCount})
                    </span>
                  </div>
                </div>

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
                  {product.taxa_parcela > 0 &&
                    `com taxa estimada de ${product.taxa_parcela}%`}
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

        {/* CARDS DE GARANTIA */}
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

        {/* DESCRIÇÃO DETALHADA */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Descrição
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
                  <p className="text-sm leading-7 text-slate-700">
                    {sentence}.
                  </p>
                </div>
              ))}
          </div>
        </section>

        {/* SESSÃO DE AVALIAÇÕES DOS CLIENTES */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Opinião dos compradores
              </p>
              <h3 className="font-display text-2xl font-semibold text-slate-950">
                Avaliações do Produto
              </h3>
            </div>
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
              >
                {showReviewForm ? "Cancelar Avaliação" : "Escrever Avaliação"}
              </button>
            )}
          </div>

          {/* FORMULÁRIO DE NOVA AVALIAÇÃO */}
          {showReviewForm && (
            <form
              onSubmit={handleAddReviewSubmit}
              className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 space-y-4"
            >
              <h4 className="text-base font-semibold text-slate-900">
                Deixe a sua opinião
              </h4>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nota do produto:
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-xl focus:outline-none"
                    >
                      <FontAwesomeIcon
                        icon={faStar}
                        className={
                          star <= (hoverRating || newRating)
                            ? "text-amber-400"
                            : "text-slate-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Seu comentário:
                </label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Conte o que achou da qualidade, entrega e desempenho..."
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  URL da Foto (opcional):
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <input
                    type="url"
                    value={newImgUrl}
                    onChange={(e) => setNewImgUrl(e.target.value)}
                    placeholder="https://suaimagem.com/foto.jpg"
                    className="w-full text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Enviar Avaliação
              </button>
            </form>
          )}

          {/* RESUMO DE NOTA */}
          <div className="mt-8 flex flex-col gap-6 rounded-[24px] bg-slate-50 p-6 md:flex-row md:items-center">
            <div className="flex flex-col items-center justify-center border-b border-slate-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
              <span className="text-5xl font-extrabold text-slate-950">
                {averageRating}
              </span>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FontAwesomeIcon
                    key={s}
                    icon={faStar}
                    className={
                      s <= Math.round(Number(averageRating))
                        ? "text-amber-400"
                        : "text-slate-300"
                    }
                  />
                ))}
              </div>
              <span className="mt-2 text-xs font-medium text-slate-500">
                Baseado em {totalReviewsCount} avaliação(ões)
              </span>
            </div>

            {/* LISTA DAS AVALIAÇÕES */}
            <div className="flex-1 space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-[20px] border border-slate-200/80 bg-white p-4 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {review.userName}
                        </p>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600">
                            <BadgeCheck className="h-3 w-3" /> Compra Verificada
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {review.createdAt}
                    </span>
                  </div>

                  <div className="flex gap-1 text-xs">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesomeIcon
                        key={star}
                        icon={faStar}
                        className={
                          star <= review.rating
                            ? "text-amber-400"
                            : "text-slate-200"
                        }
                      />
                    ))}
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {review.comment}
                  </p>

                  {review.imageUrl && (
                    <div className="pt-2">
                      <img
                        src={review.imageUrl}
                        alt="Foto da avaliação"
                        className="h-20 w-20 rounded-xl object-cover border border-slate-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUTOS RELACIONADOS */}
        <section>
          <Produtos
            categoria={product.categoria as never}
            titulo="Produtos Relacionados"
          />
        </section>

        {/* NAVEGAÇÃO / BOTÃO FIXO MOBILE */}
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)] z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
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
    </div>
  );
};

export default ProductPage;
