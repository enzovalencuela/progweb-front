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
  avaliacoes?: number;
  mediaAvaliacao?: number;
  salesCount?: number;
  createdAt?: string;
  disponivel: boolean;
}
