import React, { useState, useEffect } from "react";
import SideBar from "../../components/SideBar/index";
import Footer from "../../components/Footer/index";
import { FaPlus, FaTimes, FaSearch, FaDollarSign, FaEdit, FaTrash, FaEye, FaBox } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { usePlataforma } from "../../context/PlataformaContext";
import "./styles.css";

function ProdutosPedido() {
  const API_URL = "https://back-pdv-production.up.railway.app/produtos-pedido";
  const { getAuthHeaders, usuario: usuarioLogado } = usePlataforma();
  
  const [produtosPedido, setProdutosPedido] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [produtoParaDeletar, setProdutoParaDeletar] = useState(null);
  const [produtoEditando, setProdutoEditando] = useState(null);

  const [formData, setFormData] = useState({
    nome: "",
    valor: "",
    foto_principal: "",
    descricao: "",
    categoria: "",
    observacoes: ""
  });

  useEffect(() => {
    carregarProdutosPedido();
  }, []);

  const carregarProdutosPedido = async () => {
    try {
      setLoadingProdutos(true);
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders()
      });
      
      const produtosMapeados = response.data.map(produto => ({
        id: `PROD-${String(produto.produto_pedido_id).padStart(3, '0')}`,
        produto_pedido_id: produto.produto_pedido_id,
        nome: produto.nome,
        valor: produto.valor,
        foto_principal: produto.foto_principal,
        descricao: produto.descricao || "Sem descrição",
        categoria: produto.categoria || "Sem categoria",
        observacoes: produto.observacoes || "",
        data_cadastro: produto.data_cadastro,
        data_update: produto.data_update,
        empresa_nome: produto.Empresa?.nome || "Empresa não informada",
        empresa_email: produto.Empresa?.email || "-",
        empresa_role: produto.Empresa?.role || "-",
        status: produto.status || "ativo"
      }));
      
      setProdutosPedido(produtosMapeados);
    } catch (error) {
      console.error("Erro ao carregar produtos dos pedidos:", error);
      toast.error("Erro ao carregar produtos dos pedidos!");
    } finally {
      setLoadingProdutos(false);
      setLoading(false);
    }
  };

  const filteredProducts = produtosPedido.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return produto.status === filter;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ativo: { label: "Ativo", class: "status-active" },
      inativo: { label: "Inativo", class: "status-inactive" }
    };
    return statusConfig[status] || { label: status, class: "status-default" };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB!");
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione um arquivo de imagem válido!");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          foto_principal: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const abrirModalNovo = () => {
    setProdutoEditando(null);
    setFormData({
      nome: "",
      valor: "",
      foto_principal: "",
      descricao: "",
      categoria: "",
      observacoes: ""
    });
    setShowModal(true);
  };

  const abrirModalEditar = (produto) => {
    setProdutoEditando(produto);
    setFormData({
      nome: produto.nome,
      valor: produto.valor.toString(),
      foto_principal: produto.foto_principal || "",
      descricao: produto.descricao || "",
      categoria: produto.categoria || "",
      observacoes: produto.observacoes || ""
    });
    setShowModal(true);
  };

  const abrirModalDetalhes = (produto) => {
    setProdutoEditando(produto);
    setShowDetailModal(true);
  };

  const abrirModalDeletar = (produto) => {
    setProdutoParaDeletar(produto);
    setShowDeleteModal(true);
  };

  const fecharModais = () => {
    setShowModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setProdutoEditando(null);
    setProdutoParaDeletar(null);
    setFormData({
      nome: "",
      valor: "",
      foto_principal: "",
      descricao: "",
      categoria: "",
      observacoes: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nome: formData.nome,
        valor: parseFloat(formData.valor),
        foto_principal: formData.foto_principal || "",
        descricao: formData.descricao || "",
        categoria: formData.categoria || "",
        observacoes: formData.observacoes || "",
        empresa_id: usuarioLogado?.usuario_id
      };

      if (produtoEditando) {
        // Editar produto existente
        await axios.put(`${API_URL}/${produtoEditando.produto_pedido_id}`, payload, {
          headers: getAuthHeaders()
        });
        toast.success("Produto atualizado com sucesso!");
      } else {
        // Criar novo produto
        await axios.post(API_URL, payload, {
          headers: getAuthHeaders()
        });
        toast.success("Produto cadastrado com sucesso!");
      }

      await carregarProdutosPedido();
      fecharModais();

    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error(`Erro ao ${produtoEditando ? 'atualizar' : 'cadastrar'} produto. Tente novamente!`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!produtoParaDeletar) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${produtoParaDeletar.produto_pedido_id}`, {
        headers: getAuthHeaders()
      });
      
      toast.success("Produto deletado com sucesso!");
      await carregarProdutosPedido();
      fecharModais();
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      toast.error("Erro ao deletar produto. Tente novamente!");
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const totalProdutos = produtosPedido.length;
  const produtosAtivos = produtosPedido.filter(p => p.status === 'ativo').length;
  const produtosInativos = produtosPedido.filter(p => p.status === 'inativo').length;
  const totalValor = produtosPedido.reduce((total, produto) => total + (produto.valor || 0), 0);

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <div className="products-order-container">
          <ToastContainer />
          
          <div className="products-order-header">
            <div className="header-actions">
              <div className="header-title">
                <h1>Produtos dos Pedidos</h1>
                <p>Gerencie todos os produtos associados aos pedidos</p>
              </div>
              <div className="header-buttons">
                <button 
                  className="nav-btn orders-btn"
                  onClick={() => window.location.href = '/pedidos'}
                >
                  📋 Voltar para Pedidos
                </button>
                <button 
                  className="new-product-btn"
                  onClick={abrirModalNovo}
                >
                  <FaPlus /> Novo Produto
                </button>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="products-stats">
            <div className="stat-card total">
              <div className="stat-icon">
                <FaBox />
              </div>
              <div className="stat-content">
                <span className="stat-number">{totalProdutos}</span>
                <span className="stat-label">Total de Produtos</span>
              </div>
            </div>
            
            <div className="stat-card active">
              <div className="stat-icon">
                <FaBox />
              </div>
              <div className="stat-content">
                <span className="stat-number">{produtosAtivos}</span>
                <span className="stat-label">Produtos Ativos</span>
              </div>
            </div>

            <div className="stat-card inactive">
              <div className="stat-icon">
                <FaBox />
              </div>
              <div className="stat-content">
                <span className="stat-number">{produtosInativos}</span>
                <span className="stat-label">Produtos Inativos</span>
              </div>
            </div>
            
            <div className="stat-card revenue">
              <div className="stat-icon">
                <FaDollarSign />
              </div>
              <div className="stat-content">
                <span className="stat-number">{formatCurrency(totalValor)}</span>
                <span className="stat-label">Valor Total em Estoque</span>
              </div>
            </div>
          </div>

          {/* Controles (Busca e Filtros) */}
          <div className="products-controls">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por nome, categoria ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="products-filters">
              <button 
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Todos
              </button>
              <button 
                className={`filter-btn ${filter === "ativo" ? "active" : ""}`}
                onClick={() => setFilter("ativo")}
              >
                Ativos
              </button>
              <button 
                className={`filter-btn ${filter === "inativo" ? "active" : ""}`}
                onClick={() => setFilter("inativo")}
              >
                Inativos
              </button>
            </div>
          </div>

          {/* Lista de Produtos */}
          <div className="products-list">
            {loadingProdutos ? (
              <div className="no-products">
                <p>Carregando produtos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-products">
                <p>Nenhum produto encontrado</p>
              </div>
            ) : (
              filteredProducts.map((produto) => {
                const statusInfo = getStatusBadge(produto.status);
                return (
                  <div key={produto.produto_pedido_id} className="product-card">
                    <div className="product-card-content">
                      {produto.foto_principal && (
                        <div className="product-image">
                          <img 
                            src={produto.foto_principal} 
                            alt={produto.nome}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="product-info-container">
                        <div className="product-header">
                          <div className="product-info">
                            <h3 className="product-id">{produto.id}</h3>
                            <span className="product-name">{produto.nome}</span>
                          </div>
                          <div className="product-badges">
                            <span className={`status-badge ${statusInfo.class}`}>
                              {statusInfo.label}
                            </span>
                            <span className="value-badge">{formatCurrency(produto.valor)}</span>
                          </div>
                        </div>

                        <div className="product-details">
                          <div className="category-info">
                            <h4><FaBox /> Categoria</h4>
                            <p><strong>{produto.categoria}</strong></p>
                            <p>{produto.descricao}</p>
                          </div>

                          <div className="company-info">
                            <h4>🏢 Empresa</h4>
                            <p><strong>{produto.empresa_nome}</strong></p>
                            <p>{produto.empresa_email}</p>
                            <p>Tipo: {produto.empresa_role}</p>
                          </div>

                          <div className="product-date-info">
                            <h4>📅 Datas</h4>
                            <div className="date-details">
                              <span className="date">Cadastro: {formatDateTime(produto.data_cadastro)}</span>
                              {produto.data_update && (
                                <span className="date">Atualização: {formatDateTime(produto.data_update)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {produto.observacoes && (
                          <div className="notes-section">
                            <h4>Observações</h4>
                            <p className="notes">{produto.observacoes}</p>
                          </div>
                        )}

                        <div className="product-actions">
                          <button 
                            className="action-btn details-btn"
                            onClick={() => abrirModalDetalhes(produto)}
                          >
                            <FaEye /> Detalhes
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => abrirModalEditar(produto)}
                          >
                            <FaEdit /> Editar
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => abrirModalDeletar(produto)}
                          >
                            <FaTrash /> Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <Footer />
      </div>

      {/* Modal de Adicionar/Editar Produto */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content product-modal">
            <div className="modal-header">
              <h2>{produtoEditando ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button className="modal-close" onClick={fecharModais}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-section">
                <h3>Informações do Produto</h3>
                
                <div className="form-group">
                  <label htmlFor="nome">Nome do Produto *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Camiseta Básica, Caneca Personalizada, etc."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="valor">Valor (R$) *</label>
                    <input
                      type="number"
                      id="valor"
                      name="valor"
                      value={formData.valor}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="categoria">Categoria *</label>
                    <input
                      type="text"
                      id="categoria"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: Vestuário, Acessórios, etc."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="descricao">Descrição</label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Descreva o produto..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="observacoes">Observações</label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Observações adicionais..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="foto">Foto do Produto (opcional)</label>
                  <label className="file-upload-label">
                    <input
                      type="file"
                      id="foto"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                      disabled={loading}
                    />
                    <span className="file-upload-button">
                      {formData.foto_principal ? 'Alterar Foto' : 'Selecionar Foto'}
                    </span>
                  </label>
                  {formData.foto_principal && (
                    <div className="image-preview">
                      <img src={formData.foto_principal} alt="Preview do produto" />
                      <button 
                        type="button"
                        className="remove-image-btn"
                        onClick={() => setFormData(prev => ({ ...prev, foto_principal: "" }))}
                      >
                        <FaTimes /> Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fecharModais}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : (produtoEditando ? "Atualizar Produto" : "Cadastrar Produto")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetailModal && produtoEditando && (
        <div className="modal-overlay">
          <div className="modal-content product-modal">
            <div className="modal-header">
              <h2>Detalhes do Produto</h2>
              <button className="modal-close" onClick={fecharModais}>
                <FaTimes />
              </button>
            </div>

            <div className="product-details-modal">
              {produtoEditando.foto_principal && (
                <div className="detail-image">
                  <img src={produtoEditando.foto_principal} alt={produtoEditando.nome} />
                </div>
              )}
              
              <div className="detail-info">
                <div className="detail-group">
                  <h3>Informações do Produto</h3>
                  <p><strong>ID:</strong> {produtoEditando.id}</p>
                  <p><strong>Nome:</strong> {produtoEditando.nome}</p>
                  <p><strong>Valor:</strong> {formatCurrency(produtoEditando.valor)}</p>
                  <p><strong>Categoria:</strong> {produtoEditando.categoria}</p>
                  <p><strong>Descrição:</strong> {produtoEditando.descricao}</p>
                  {produtoEditando.observacoes && (
                    <p><strong>Observações:</strong> {produtoEditando.observacoes}</p>
                  )}
                </div>

                <div className="detail-group">
                  <h3>Empresa</h3>
                  <p><strong>Nome:</strong> {produtoEditando.empresa_nome}</p>
                  <p><strong>Email:</strong> {produtoEditando.empresa_email}</p>
                  <p><strong>Tipo:</strong> {produtoEditando.empresa_role}</p>
                </div>

                <div className="detail-group">
                  <h3>Datas</h3>
                  <p><strong>Cadastro:</strong> {formatDateTime(produtoEditando.data_cadastro)}</p>
                  {produtoEditando.data_update && (
                    <p><strong>Atualização:</strong> {formatDateTime(produtoEditando.data_update)}</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={fecharModais}
                >
                  Fechar
                </button>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={() => {
                    setShowDetailModal(false);
                    abrirModalEditar(produtoEditando);
                  }}
                >
                  <FaEdit /> Editar Produto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && produtoParaDeletar && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h2>Confirmar Exclusão</h2>
              <button className="modal-close" onClick={fecharModais}>
                <FaTimes />
              </button>
            </div>

            <div className="delete-content">
              <div className="warning-icon">
                <FaTrash />
              </div>
              <h3>Tem certeza que deseja excluir este produto?</h3>
              <p><strong>{produtoParaDeletar.nome}</strong> - {formatCurrency(produtoParaDeletar.valor)}</p>
              <p className="warning-text">Esta ação não pode ser desfeita!</p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={fecharModais}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProdutosPedido;