import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPlus, FaBox } from "react-icons/fa";
import axios from "axios";
import { useImovel } from "../../context/ImovelContext";
import "./styles.css";
import { ToastContainer, toast } from 'react-toastify';
import { Link } from "react-router-dom";

function ProductListAdmin() {
  const [imoveis, setImoveis] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const { filtros } = useImovel();

  useEffect(() => {
    const fetchImoveis = async () => {
      try {
        const params = new URLSearchParams(filtros);
        const url = `https://api-corretora-production.up.railway.app/imovel${params.toString() ? `?${params}` : ""}`;
        const response = await axios.get(url);
        setImoveis(response.data.length ? response.data : []);
        setNotFound(response.data.length === 0);
      } catch (error) {
        setNotFound(error.response?.status === 404);
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchImoveis();
  }, [filtros]);

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await axios.delete(`https://api-corretora-production.up.railway.app/imovel/${id}`);
        setImoveis(imoveis.filter(imovel => imovel.imovel_id !== id));
        toast.success("Produto excluído com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        toast.error("Erro ao excluir produto. Tente novamente!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="product-admin-container">
      <ToastContainer />
      
      {/* Header */}
      <div className="product-admin-header">
        <div className="header-title">
          <FaBox className="header-icon" />
          <h1>Gerenciar Produtos</h1>
        </div>
        <Link to="/cadastro-produto" className="add-product-btn">
          <FaPlus /> Adicionar Produto
        </Link>
      </div>

      {/* Lista de Produtos */}
      <div className="products-list-container">
        {notFound ? (
          <div className="not-found-message">
            <FaBox className="not-found-icon" />
            <h3>Nenhum produto encontrado</h3>
            <p>Clique em "Adicionar Produto" para cadastrar o primeiro produto</p>
          </div>
        ) : (
          <div className="products-table">
            <div className="table-header">
              <div className="table-col photo">Foto</div>
              <div className="table-col name">Nome do Produto</div>
              <div className="table-col price">Preço</div>
              <div className="table-col stock">Estoque</div>
              <div className="table-col category">Categoria</div>
              <div className="table-col actions">Ações</div>
            </div>

            <div className="table-body">
              {imoveis.map((imovel) => (
                <div key={imovel.imovel_id} className="table-row">
                  <div className="table-col photo">
                    <img 
                      src={imovel.imageData} 
                      alt={imovel.nome}
                      className="product-photo"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/50x50?text=Produto';
                      }}
                    />
                  </div>
                  <div className="table-col name">
                    <div className="product-name">{imovel.nome}</div>
                    <div className="product-description">{imovel.description}</div>
                  </div>
                  <div className="table-col price">
                    <span className="price-value">{formatCurrency(imovel.valor)}</span>
                    {imovel.tipo_transacao === 'Aluguel' && (
                      <span className="price-period">/mês</span>
                    )}
                  </div>
                  <div className="table-col stock">
                    {/* Simulando estoque - você pode adaptar conforme sua necessidade */}
                    <span className="stock-badge in-stock">Em Estoque</span>
                  </div>
                  <div className="table-col category">
                    <span className="category-tag">{imovel.tipo.nome}</span>
                  </div>
                  <div className="table-col actions">
                    <Link 
                      to={`/editar-produto/${imovel.imovel_id}`}
                      className="action-btn edit-btn"
                      title="Editar produto"
                    >
                      <FaEdit />
                    </Link>
                    <button 
                      onClick={() => handleDelete(imovel.imovel_id)}
                      className="action-btn delete-btn"
                      title="Excluir produto"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="products-stats">
        <div className="stat-card">
          <span className="stat-number">{imoveis.length}</span>
          <span className="stat-label">Total de Produtos</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {imoveis.filter(p => p.valor > 0).length}
          </span>
          <span className="stat-label">Produtos Ativos</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {new Set(imoveis.map(p => p.tipo.nome)).size}
          </span>
          <span className="stat-label">Categorias</span>
        </div>
      </div>
    </div>
  );
}

export default ProductListAdmin;