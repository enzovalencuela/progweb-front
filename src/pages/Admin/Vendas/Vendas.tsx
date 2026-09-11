/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import BackButton from "../../../components/BackButton/BackButton";
import CustomChart from "../../../components/CustomChart/CustomChart";
import "./Vendas.css";
import ErrorMessage from "../../../components/ErrorMessage/ErrorMessage";
import Loading from "../../../components/Loading/Loading";

export interface CustomChartProps {
  labels: string[];
  data: number[];
  type: "line" | "bar";
}

interface Category {
  category: string;
  total: number;
}

interface Product {
  product: string;
  total: number;
}

interface SalesTotal {
  total: number;
}

interface Revenue {
  revenue: number;
}

interface SalesPerWeek {
  week: string;
  total: number;
}

function Vendas() {
  const [categorySales, setCategorySales] = useState<Category[]>();
  const [products, setProducts] = useState<Product[]>();
  const [salesTotal, setSalesTotal] = useState<Revenue>();
  const [productsSalesTotal, setProductsSalesTotal] = useState<SalesTotal>();
  const [salesPerWeek, setSalesPerWeek] = useState<SalesPerWeek[]>();
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const salesCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${VITE_BACKEND_URL}/api/sales/categories`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar vendas por categoria");
        }

        const data = await response.json();

        setCategorySales(data);
        setLoading(false);
      } catch (error) {
        setShowErrorMessage(true);
        console.error("Erro ao buscar vedndas por categoria", error);
        setLoading(false);
      }
    };

    salesCategories();

    const salesProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/api/sales/products`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar total de vendas");
        }

        const data = await response.json();

        setProducts(data);
        setLoading(false);
      } catch (error) {
        setShowErrorMessage(true);
        console.error("Erro ao buscar total de vendas", error);
        setLoading(false);
      }
    };

    salesProducts();

    const ProductsSalesTotal = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/api/sales/total`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar total de produtos vendidos");
        }

        const data = await response.json();

        setProductsSalesTotal(data);
        setLoading(false);
      } catch (error) {
        setShowErrorMessage(true);
        console.error("Erro ao buscar total de produtos vendidos", error);
        setLoading(false);
      }
    };

    ProductsSalesTotal();

    const salesTotal = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/api/sales/revenue`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar vendas total");
        }

        const data = await response.json();

        setSalesTotal(data);
        setLoading(false);
      } catch (error) {
        setShowErrorMessage(true);
        console.error("Erro ao buscar vendas total", error);
        setLoading(false);
      }
    };

    salesTotal();

    const salesPerWeek = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/api/sales/weekly`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar vendas por semana");
        }

        const data = await response.json();

        setSalesPerWeek(data);
        setLoading(false);
      } catch (error) {
        setShowErrorMessage(true);
        console.error("Erro ao buscar vendas por semana", error);
        setLoading(false);
      }
    };

    salesPerWeek();
  }, []);

  return loading ? (
    <Loading />
  ) : (
    <div className="vendas-container">
      {showErrorMessage && (
        <ErrorMessage onClose={() => setShowErrorMessage(false)} />
      )}
      <BackButton />
      <h1>Vendas</h1>
      <div className="vendas-tables">
        {categorySales ? (
          <div>
            <h2>Por Categoria</h2>
            <CustomChart
              type="bar"
              labels={categorySales.map((c) => c.category)}
              data={categorySales.map((c) => c.total)}
            />
          </div>
        ) : (
          <div>
            <h2>Nenhuma venda por categoria encontrada</h2>
          </div>
        )}

        {products ? (
          <div>
            <h2>Por Produto</h2>
            <CustomChart
              type="bar"
              labels={products.map((p) => p.product)}
              data={products.map((p) => p.total)}
            />
          </div>
        ) : (
          <div>
            <h2>Nenhuma venda por produto encontrada</h2>
          </div>
        )}

        {salesPerWeek ? (
          <div>
            <h2>Por Semana</h2>
            <CustomChart
              type="bar"
              labels={salesPerWeek.map((p) => {
                const isoDate = p.week;
                const dateObject = new Date(isoDate);
                const shortFormat = new Intl.DateTimeFormat("pt-BR").format(
                  dateObject
                );
                return shortFormat;
              })}
              data={salesPerWeek.map((p) => p.total)}
            />
          </div>
        ) : (
          <div>
            <h2>Nenhuma venda por semana encontrada</h2>
          </div>
        )}
        {productsSalesTotal ? (
          <div>
            <h2>Total de produtos vendidos:</h2>
            <p>{productsSalesTotal.total}</p>
          </div>
        ) : (
          <div>
            <h2>Nenhum produto vendido encontrado</h2>
          </div>
        )}
        {salesTotal ? (
          <div>
            <h2>Valor total em vendas:</h2>
            <p>R${salesTotal.revenue}</p>
          </div>
        ) : (
          <div>
            <h2>Nenhuma venda encontrada</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default Vendas;
