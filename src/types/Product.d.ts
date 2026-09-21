export interface Product {
  id: number;
  titulo: string;
  descricao: string;
  img: string;
  preco: number;
  preco_original?: number;
  max_parcelas: number;
  taxa_parcela: number;
  categoria: string;
  tags?: string[];
  cores?: string[];
  peso_kg?: number;
  largura_cm?: number;
  altura_cm?: number;
  comprimento_cm?: number;
  estoque: number;
  createdAt?: string;
  disponivel: boolean;
}
