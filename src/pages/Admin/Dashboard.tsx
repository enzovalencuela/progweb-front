import React, { useMemo, useState } from "react";
import { useProduct } from "../../contexts/ProductContext";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  CreditCard,
  LayoutDashboard,
  Package,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProdutosDashboard from "./Produtos/Produtos";
import Loading from "../../components/Loading/Loading";
import { motion } from "framer-motion";

type DashboardView = "overview" | "catalog";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);

const Dashboard: React.FC = () => {
  const { produtos, setProdutos, products, loading } = useProduct();
  const [activeView, setActiveView] = useState<DashboardView>(
    produtos ? "catalog" : "overview"
  );

  const availableProducts = useMemo(
    () => products.filter((product) => product.disponivel),
    [products]
  );
  const pendingProducts = useMemo(
    () => products.filter((product) => !product.disponivel),
    [products]
  );

  const totalBalance = availableProducts.reduce(
    (accumulator, product) => accumulator + Number(product.preco || 0),
    0
  );
  const monthlySales = availableProducts.slice(0, 6).reduce(
    (accumulator, product) =>
      accumulator + Number(product.salesCount || 0) * Number(product.preco),
    0
  );
  const stats = [
    {
      title: "Saldo Total",
      value: formatCurrency(totalBalance),
      description: "Valor estimado do catálogo disponível",
      icon: Wallet,
    },
    {
      title: "Vendas do Mês",
      value: formatCurrency(monthlySales),
      description: "Estimativa com base nos itens mais relevantes",
      icon: CreditCard,
    },
    {
      title: "Transações Pendentes",
      value: String(pendingProducts.length),
      description: "Itens exigindo revisão ou reativação",
      icon: Clock3,
    },
  ];

  const navItems = [
    { id: "overview" as const, label: "Visão geral", icon: LayoutDashboard },
    { id: "catalog" as const, label: "Catálogo", icon: Package },
  ];

  if (loading && activeView === "overview") {
    return <Loading variant="dashboard" />;
  }

  return (
    <div className="grid gap-6 px-4 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
      <aside className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-soft">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Admin Panel
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold">
            Dashboard
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Navegação pensada para gestão de catálogo e visão rápida do negócio.
          </p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setProdutos(item.id === "catalog");
              }}
              whileTap={{ scale: 0.98 }}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                activeView === item.id
                  ? "bg-white text-slate-950"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </motion.button>
          ))}
        </nav>
        <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold">Atalhos</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <Link
              to="/"
              className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              Voltar para loja
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/produtos/search?q=Setups"
              className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              Ver vitrine
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            {activeView === "overview" ? "Operação" : "Catálogo"}
          </p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold text-slate-950">
                {activeView === "overview"
                  ? "Painel administrativo com leitura rápida"
                  : "Gestão de produtos com visão premium"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                {activeView === "overview"
                  ? "Resumo executivo com métricas essenciais do catálogo e da operação."
                  : "O catálogo segue exibindo todos os produtos e permite editar, adicionar e remover itens normalmente."}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              <BarChart3 className="h-4 w-4" />
              {products.length} itens monitorados
            </div>
          </div>
        </div>

        {activeView === "overview" ? (
          <>
            <div className="grid gap-5 xl:grid-cols-3">
              {stats.map((stat, index) => (
                <motion.article
                  key={stat.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.24 }}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">
                    {stat.title}
                  </p>
                  <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                    {stat.value}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {stat.description}
                  </p>
                </motion.article>
              ))}
            </div>

          </>
        ) : loading ? (
          <Loading variant="dashboard" />
        ) : (
          <div className="rounded-[32px] border border-slate-200 bg-white p-2 shadow-sm sm:p-4">
            <ProdutosDashboard embedded />
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
