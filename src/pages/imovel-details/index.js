import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaSearch } from "react-icons/fa";
import axios from "axios";
import { useImovel } from "../../context/ImovelContext";
import "./styles.css";
import { ToastContainer, toast } from 'react-toastify';
import NavBar from "../../components/NavBar/index";

function PDVVendas() {
  const [imoveis, setImoveis] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { filtros } = useImovel();

  useEffect(() => {
    const fetchImoveis = async () => {
      try {
        const params = new URLSearchParams(filtros);
        const url = `https://api-corretora-production.up.railway.app/imovel${params.toString() ? `?${params}` : ""}`;
        const response = await axios.get(url);
        setImoveis(response.data.length ? response.data : []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchImoveis();
  }, [filtros]);

  useEffect(() => {
    // Filtrar produtos baseado no termo de pesquisa (nome ou código)
    const filtered = imoveis.filter(imovel =>
      imovel.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.imovel_id.toString().includes(searchTerm)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, imoveis]);

  const adicionarAoCarrinho = (imovel) => {
    setCarrinho(prev => {
      const existingItem = prev.find(item => item.imovel_id === imovel.imovel_id);
      if (existingItem) {
        return prev.map(item =>
          item.imovel_id === imovel.imovel_id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...prev, { ...imovel, quantidade: 1 }];
      }
    });
    toast.success("Produto adicionado ao carrinho!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const removerDoCarrinho = (imovelId) => {
    setCarrinho(prev => prev.filter(item => item.imovel_id !== imovelId));
    toast.info("Produto removido do carrinho!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const ajustarQuantidade = (imovelId, novaQuantidade) => {
    if (novaQuantidade < 1) {
      removerDoCarrinho(imovelId);
      return;
    }
    setCarrinho(prev =>
      prev.map(item =>
        item.imovel_id === imovelId
          ? { ...item, quantidade: novaQuantidade }
          : item
      )
    );
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.valor * item.quantidade), 0);
  };

  const finalizarVenda = () => {
    if (carrinho.length === 0) {
      toast.error("Adicione produtos ao carrinho primeiro!");
      return;
    }
    
    // Simulação de finalização de venda
    toast.success(`Venda finalizada! Total: R$ ${calcularTotal().toFixed(2)}`, {
      position: "top-center",
      autoClose: 3000,
    });
    setCarrinho([]);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="container">
      <NavBar />
      <div className="main-content">
        <div className="pdv-vendas-container">
          <ToastContainer />
          
          {/* Header do PDV */}
          <div className="pdv-header">
            <h1>Ponto de Venda</h1>
            <div className="carrinho-info">
              <FaShoppingCart className="carrinho-icon" />
              <span className="carrinho-count">{carrinho.length} itens</span>
              <span className="carrinho-total">{formatCurrency(calcularTotal())}</span>
              <button 
                className="finalizar-venda-btn"
                onClick={finalizarVenda}
                disabled={carrinho.length === 0}
              >
                Finalizar Venda
              </button>
            </div>
          </div>

          <div className="pdv-content">
            {/* Seção de Pesquisa e Lista de Produtos */}
            <div className="produtos-section">
              <div className="search-section">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome ou código do produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="produtos-lista">
                <h3>Produtos Encontrados</h3>
                {filteredProducts.length === 0 ? (
                  <div className="no-products">
                    <p>Nenhum produto encontrado</p>
                  </div>
                ) : (
                  <div className="products-mini-list">
                    {filteredProducts.map((imovel) => (
                      <div key={imovel.imovel_id} className="product-mini-item">
                        <div className="product-mini-info">
                          <div className="product-mini-name">{imovel.nome}</div>
                          <div className="product-mini-code">Cód: {imovel.imovel_id}</div>
                          <div className="product-mini-price">{formatCurrency(imovel.valor)}</div>
                        </div>
                        <div className="product-mini-actions">
                          <button 
                            onClick={() => adicionarAoCarrinho(imovel)}
                            className="add-btn"
                            title="Adicionar ao carrinho"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lista Completa de Produtos */}
              <div className="produtos-completa">
                <h3>Todos os Produtos</h3>
                <div className="produtos-grid">
                  {imoveis.map((imovel) => (
                    <div key={imovel.imovel_id} className="produto-card">
                      <div className="produto-image-container">
                        <img 
                          src={imovel.imageData} 
                          alt={imovel.nome} 
                          className="produto-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+Indisponível';
                          }}
                        />
                      </div>
                      
                      <div className="produto-details">
                        <h4 className="produto-title">{imovel.nome}</h4>
                        <div className="produto-code">Código: {imovel.imovel_id}</div>
                        <p className="produto-description">{imovel.description}</p>
                        
                        <div className="produto-info">
                          <div className="info-item">
                            <span>Categoria:</span>
                            <strong>{imovel.tipo.nome}</strong>
                          </div>
                          <div className="info-item">
                            <span>Estoque:</span>
                            <strong className="in-stock">Disponível</strong>
                          </div>
                        </div>
                        
                        <div className="produto-preco-section">
                          <div className="produto-preco">
                            <span className="preco-valor">{formatCurrency(imovel.valor)}</span>
                            {imovel.tipo_transacao === 'Aluguel' && (
                              <span className="preco-periodo">/mês</span>
                            )}
                          </div>
                          <button 
                            onClick={() => adicionarAoCarrinho(imovel)}
                            className="add-carrinho-btn"
                          >
                            <FaPlus /> Adicionar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carrinho de Compras */}
            <div className="carrinho-section">
              <h2>Carrinho de Vendas</h2>
              <div className="carrinho-container">
                {carrinho.length === 0 ? (
                  <div className="carrinho-vazio">
                    <FaShoppingCart className="carrinho-vazio-icon" />
                    <p>Seu carrinho está vazio</p>
                    <span>Adicione produtos para iniciar uma venda</span>
                  </div>
                ) : (
                  <div className="carrinho-itens">
                    {carrinho.map((item) => (
                      <div key={item.imovel_id} className="carrinho-item">
                        <div className="item-info">
                          <div className="item-image">
                            <img 
                              src={item.imageData} 
                              alt={item.nome}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/50x50?text=Img';
                              }}
                            />
                          </div>
                          <div className="item-details">
                            <h4>{item.nome}</h4>
                            <div className="item-code">Cód: {item.imovel_id}</div>
                            <span className="item-preco">{formatCurrency(item.valor)}</span>
                          </div>
                        </div>
                        
                        <div className="item-controls">
                          <div className="quantidade-controller">
                            <button 
                              onClick={() => ajustarQuantidade(item.imovel_id, item.quantidade - 1)}
                              className="quantidade-btn"
                            >
                              <FaMinus />
                            </button>
                            <span className="quantidade">{item.quantidade}</span>
                            <button 
                              onClick={() => ajustarQuantidade(item.imovel_id, item.quantidade + 1)}
                              className="quantidade-btn"
                            >
                              <FaPlus />
                            </button>
                          </div>
                          
                          <div className="item-total">
                            {formatCurrency(item.valor * item.quantidade)}
                          </div>
                          
                          <button 
                            onClick={() => removerDoCarrinho(item.imovel_id)}
                            className="remover-item-btn"
                            title="Remover do carrinho"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="carrinho-total-section">
                      <div className="total-line">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(calcularTotal())}</span>
                      </div>
                      <div className="total-line">
                        <span>Desconto:</span>
                        <span>R$ 0,00</span>
                      </div>
                      <div className="total-line final">
                        <span>Total:</span>
                        <strong>{formatCurrency(calcularTotal())}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDVVendas;