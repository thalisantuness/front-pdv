import React, { useState, useEffect } from "react";
import SideBar from "../../components/SideBar/index";
import Footer from "../../components/Footer/index";
import { FaPlus, FaTimes, FaSearch, FaDollarSign, FaUser, FaBox, FaCalendar, FaEdit, FaTrash, FaEye, FaCheck, FaBan, FaShoppingCart, FaMoneyBillWave, FaChartLine, FaCalendarCheck } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { usePlataforma } from "../../context/PlataformaContext";
import "./styles.css";

function OrdersPage() {
  const API_URL = "https://back-pdv-production.up.railway.app/pedidos";
  const PRODUTOS_PEDIDO_API_URL = "https://back-pdv-production.up.railway.app/produtos-pedido";
  const USUARIOS_API_URL = "https://back-pdv-production.up.railway.app/usuarios";
  
  const { getAuthHeaders, usuario: usuarioLogado } = usePlataforma();
  
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [produtosPedido, setProdutosPedido] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pedidoParaDeletar, setPedidoParaDeletar] = useState(null);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    produto_pedido_id: "",
    cliente_id: "",
    data_hora_entrega: "",
    status: "pendente",
    observacao: ""
  });

  // Carregar pedidos, produtos e clientes ao montar o componente
  useEffect(() => {
    carregarPedidos();
    carregarProdutosPedido();
    carregarClientes();
  }, []);

  const carregarPedidos = async () => {
    try {
      setLoadingOrders(true);
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders()
      });

      const pedidosMapeados = response.data.map(pedido => {
        const produtosPedido = Array.isArray(pedido.ProdutoPedidos) ? 
          pedido.ProdutoPedidos : 
          (pedido.ProdutoPedido ? [pedido.ProdutoPedido] : []);

        const total = produtosPedido.reduce((sum, prod) => 
          sum + (prod.valor * (prod.quantidade || 1)), 0
        );

        return {
          id: `ORD-${String(pedido.pedido_id).padStart(3, '0')}`,
          pedido_id: pedido.pedido_id,
          cliente: pedido.Cliente?.nome || "Cliente não informado",
          cliente_email: pedido.Cliente?.email || "-",
          cliente_telefone: pedido.Cliente?.telefone || "-",
          cliente_role: pedido.Cliente?.role || "-",
          items: produtosPedido.map(prod => ({
            produto_pedido_id: prod.produto_pedido_id,
            name: prod.nome || "Produto não informado",
            quantity: prod.quantidade || 1,
            price: prod.valor || 0,
            foto: prod.foto_principal,
            categoria: prod.categoria || "Sem categoria",
            descricao: prod.descricao || "Sem descrição"
          })),
          total: total,
          status: pedido.status,
          data_hora_entrega: pedido.data_hora_entrega,
          observacao: pedido.observacao || "Sem observações",
          data_cadastro: pedido.data_cadastro,
          data_update: pedido.data_update,
          empresa_nome: pedido.ProdutoPedido?.Empresa?.nome || "Empresa não informada",
          empresa_email: pedido.ProdutoPedido?.Empresa?.email || "-"
        };
      });

      setOrders(pedidosMapeados);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar pedidos da API!");
    } finally {
      setLoadingOrders(false);
    }
  };

  const carregarProdutosPedido = async () => {
    try {
      setLoadingProdutos(true);
      const response = await axios.get(PRODUTOS_PEDIDO_API_URL, {
        headers: getAuthHeaders()
      });
      setProdutosPedido(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar lista de produtos!");
    } finally {
      setLoadingProdutos(false);
    }
  };

  const carregarClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await axios.get(USUARIOS_API_URL, {
        headers: getAuthHeaders()
      });
      // Filtrar apenas clientes
      const clientesFiltrados = response.data.filter(user => 
        user.role === "cliente"
      );
      setClientes(clientesFiltrados);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar lista de clientes!");
    } finally {
      setLoadingClientes(false);
    }
  };

  // Calcular estatísticas financeiras
  const calcularEstatisticas = () => {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Faturamento realizado (pedidos confirmados)
    const faturamentoRealizado = orders
      .filter(o => o.status === 'confirmado')
      .reduce((total, o) => total + o.total, 0);
    
    // Previsão de faturamento (pedidos pendentes)
    const previsaoFaturamento = orders
      .filter(o => o.status === 'pendente')
      .reduce((total, o) => total + o.total, 0);
    
    // Pedidos de hoje
    const pedidosHoje = orders.filter(o => 
      o.data_hora_entrega.split('T')[0] === hoje
    );
    
    const faturamentoHoje = pedidosHoje
      .filter(o => o.status === 'confirmado')
      .reduce((total, o) => total + o.total, 0);
    
    const previsaoHoje = pedidosHoje
      .filter(o => o.status === 'pendente')
      .reduce((total, o) => total + o.total, 0);

    return {
      faturamentoRealizado,
      previsaoFaturamento,
      faturamentoHoje,
      previsaoHoje,
      pedidosHoje: pedidosHoje.length,
      totalPedidos: orders.length,
      pendentesCount: orders.filter(o => o.status === 'pendente').length,
      confirmadosCount: orders.filter(o => o.status === 'confirmado').length,
      canceladosCount: orders.filter(o => o.status === 'cancelado').length,
    };
  };

  const estatisticas = calcularEstatisticas();

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => 
                           item.name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    if (filter === "all") return matchesSearch;
    return order.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pendente: { label: "Pendente", class: "status-pending" },
      confirmado: { label: "Confirmado", class: "status-confirmed" },
      cancelado: { label: "Cancelado", class: "status-cancelled" }
    };
    return statusConfig[status] || { label: status, class: "status-default" };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const abrirModalNovo = () => {
    setPedidoEditando(null);
    setFormData({
      produto_pedido_id: "",
      cliente_id: "",
      data_hora_entrega: "",
      status: "pendente",
      observacao: ""
    });
    setShowModal(true);
  };

  const abrirModalEditar = (pedido) => {
    setPedidoEditando(pedido);
    setFormData({
      produto_pedido_id: pedido.items[0]?.produto_pedido_id?.toString() || "",
      cliente_id: pedido.cliente_id?.toString() || "",
      data_hora_entrega: pedido.data_hora_entrega ? 
        new Date(pedido.data_hora_entrega).toISOString().slice(0, 16) : "",
      status: pedido.status,
      observacao: pedido.observacao
    });
    setShowModal(true);
  };

  const abrirModalDetalhes = (pedido) => {
    setPedidoEditando(pedido);
    setShowDetailModal(true);
  };

  const abrirModalDeletar = (pedido) => {
    setPedidoParaDeletar(pedido);
    setShowDeleteModal(true);
  };

  const fecharModais = () => {
    setShowModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setPedidoEditando(null);
    setPedidoParaDeletar(null);
    setFormData({
      produto_pedido_id: "",
      cliente_id: "",
      data_hora_entrega: "",
      status: "pendente",
      observacao: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        produto_pedido_id: parseInt(formData.produto_pedido_id),
        cliente_id: parseInt(formData.cliente_id),
        data_hora_entrega: new Date(formData.data_hora_entrega).toISOString(),
        status: formData.status,
        observacao: formData.observacao || ""
      };

      if (pedidoEditando) {
        // Editar pedido existente
        await axios.put(`${API_URL}/${pedidoEditando.pedido_id}`, payload, {
          headers: getAuthHeaders()
        });
        toast.success("Pedido atualizado com sucesso!");
      } else {
        // Criar novo pedido
        await axios.post(API_URL, payload, {
          headers: getAuthHeaders()
        });
        toast.success("Pedido criado com sucesso!");
      }

      await carregarPedidos();
      fecharModais();

    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      toast.error(`Erro ao ${pedidoEditando ? 'atualizar' : 'criar'} pedido. Tente novamente!`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pedidoParaDeletar) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${pedidoParaDeletar.pedido_id}`, {
        headers: getAuthHeaders()
      });
      
      toast.success("Pedido deletado com sucesso!");
      await carregarPedidos();
      fecharModais();
    } catch (error) {
      console.error("Erro ao deletar pedido:", error);
      toast.error("Erro ao deletar pedido. Tente novamente!");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (pedidoId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/${pedidoId}`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );

      toast.success(`Pedido ${getStatusText(newStatus)} com sucesso!`, {
        position: "top-right",
        autoClose: 3000,
      });

      await carregarPedidos();
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast.error("Erro ao atualizar pedido!");
    }
  };

  const getStatusText = (status) => {
    const statusTexts = {
      confirmado: "confirmado",
      cancelado: "cancelado"
    };
    return statusTexts[status] || "atualizado";
  };

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <div className="orders-container">
          <ToastContainer />
          
          <div className="orders-header">
            <div className="header-actions">
              <div className="header-title">
                <h1>Pedidos</h1>
                <p>Gerencie os pedidos realizados pela loja online</p>
              </div>
              <div className="header-buttons">
                <button 
                  className="nav-btn products-btn"
                  onClick={() => window.location.href = '/produtos-pedido'}
                >
                  📦 Ver Produtos
                </button>
                <button 
                  className="new-order-btn"
                  onClick={abrirModalNovo}
                >
                  <FaPlus /> Novo Pedido
                </button>
              </div>
            </div>
          </div>

          {/* Big Numbers - Estatísticas Financeiras */}
          <div className="big-numbers-grid">
            <div className="big-number-card revenue-card">
              <div className="big-number-icon">
                <FaMoneyBillWave />
              </div>
              <div className="big-number-content">
                <span className="big-number-value">
                  {formatCurrency(estatisticas.faturamentoRealizado)}
                </span>
                <span className="big-number-label">Faturamento Realizado</span>
                <span className="big-number-subtitle">Pedidos Confirmados</span>
              </div>
            </div>

            <div className="big-number-card forecast-card">
              <div className="big-number-icon">
                <FaChartLine />
              </div>
              <div className="big-number-content">
                <span className="big-number-value">
                  {formatCurrency(estatisticas.previsaoFaturamento)}
                </span>
                <span className="big-number-label">Previsão de Faturamento</span>
                <span className="big-number-subtitle">Pedidos Pendentes</span>
              </div>
            </div>

            <div className="big-number-card today-card">
              <div className="big-number-icon">
                <FaCalendarCheck />
              </div>
              <div className="big-number-content">
                <span className="big-number-value">
                  {estatisticas.pedidosHoje}
                </span>
                <span className="big-number-label">Pedidos Hoje</span>
                <div className="today-details">
                  <span className="today-revenue">
                    Confirmados: {formatCurrency(estatisticas.faturamentoHoje)}
                  </span>
                  <span className="today-forecast">
                    Pendentes: {formatCurrency(estatisticas.previsaoHoje)}
                  </span>
                </div>
              </div>
            </div>

            <div className="big-number-card total-card">
              <div className="big-number-icon">
                <FaShoppingCart />
              </div>
              <div className="big-number-content">
                <span className="big-number-value">
                  {estatisticas.totalPedidos}
                </span>
                <span className="big-number-label">Total de Pedidos</span>
                <div className="status-breakdown">
                  <span className="status-item pending">{estatisticas.pendentesCount} pendentes</span>
                  <span className="status-item confirmed">{estatisticas.confirmadosCount} confirmados</span>
                  <span className="status-item cancelled">{estatisticas.canceladosCount} cancelados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controles (Busca e Filtros) */}
          <div className="orders-controls">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por cliente, ID ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="orders-filters">
              <button 
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Todos
              </button>
              <button 
                className={`filter-btn ${filter === "pendente" ? "active" : ""}`}
                onClick={() => setFilter("pendente")}
              >
                Pendentes
              </button>
              <button 
                className={`filter-btn ${filter === "confirmado" ? "active" : ""}`}
                onClick={() => setFilter("confirmado")}
              >
                Confirmados
              </button>
              <button 
                className={`filter-btn ${filter === "cancelado" ? "active" : ""}`}
                onClick={() => setFilter("cancelado")}
              >
                Cancelados
              </button>
            </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="orders-list">
            {loadingOrders ? (
              <div className="no-orders">
                <p>Carregando pedidos...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="no-orders">
                <p>Nenhum pedido encontrado</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusInfo = getStatusBadge(order.status);
                return (
                  <div key={order.pedido_id} className="order-card">
                    <div className="order-card-content">
                      {order.items[0]?.foto && (
                        <div className="order-image">
                          <img 
                            src={order.items[0].foto} 
                            alt={order.items[0].name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="order-info-container">
                        <div className="order-header">
                          <div className="order-info">
                            <h3 className="order-id">{order.id}</h3>
                            <div className="order-summary">
                              <span className="order-total">
                                <FaDollarSign /> {formatCurrency(order.total)}
                              </span>
                              <span className="order-date">
                                <FaCalendar /> {formatDate(order.data_hora_entrega)}
                              </span>
                            </div>
                          </div>
                          <div className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.label}
                          </div>
                        </div>

                        {/* Detalhes dos Produtos */}
                        <div className="products-details-section">
                          <h4>📦 Produtos do Pedido</h4>
                          <div className="products-list">
                            {order.items.map((item, index) => (
                              <div key={index} className="product-item">
                                <div className="product-info">
                                  <strong>{item.name}</strong>
                                  <span>Qtd: {item.quantity}</span>
                                  <span>{formatCurrency(item.price)}</span>
                                </div>
                                {item.categoria && (
                                  <div className="product-category">
                                    <strong>Categoria:</strong> {item.categoria}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="order-details">
                          <div className="customer-info">
                            <h4><FaUser /> Cliente</h4>
                            <p><strong>Nome:</strong> {order.cliente}</p>
                            <p><strong>Email:</strong> {order.cliente_email}</p>
                            <p><strong>Telefone:</strong> {order.cliente_telefone}</p>
                            <p><strong>Tipo:</strong> {order.cliente_role}</p>
                          </div>

                          <div className="delivery-info">
                            <h4><FaCalendar /> Entrega</h4>
                            <div className="delivery-details">
                              <p><strong>Data/Hora:</strong> {formatDateTime(order.data_hora_entrega)}</p>
                              <p><strong>Status:</strong> {statusInfo.label}</p>
                              <p><strong>Cadastro:</strong> {formatDateTime(order.data_cadastro)}</p>
                              {order.data_update && (
                                <p><strong>Atualização:</strong> {formatDateTime(order.data_update)}</p>
                              )}
                            </div>
                          </div>

                          <div className="company-info">
                            <h4>🏢 Empresa</h4>
                            <p><strong>Nome:</strong> {order.empresa_nome}</p>
                            <p><strong>Email:</strong> {order.empresa_email}</p>
                          </div>
                        </div>

                        {order.observacao && order.observacao !== "Sem observações" && (
                          <div className="notes-section">
                            <h4>Observações</h4>
                            <p className="notes">{order.observacao}</p>
                          </div>
                        )}

                        <div className="order-actions">
                          <button 
                            className="action-btn details-btn"
                            onClick={() => abrirModalDetalhes(order)}
                          >
                            <FaEye /> Detalhes
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => abrirModalEditar(order)}
                          >
                            <FaEdit /> Editar
                          </button>
                          
                          {/* Botões para pedidos com status "pendente" */}
                          {order.status === "pendente" && (
                            <>
                              <button
                                className="action-btn confirm-btn"
                                onClick={() => handleStatusUpdate(order.pedido_id, "confirmado")}
                              >
                                <FaCheck /> Confirmar
                              </button>
                              <button
                                className="action-btn cancel-btn"
                                onClick={() => handleStatusUpdate(order.pedido_id, "cancelado")}
                              >
                                <FaBan /> Cancelar
                              </button>
                            </>
                          )}

                          {/* Botões para pedidos com status "confirmado" */}
                          {order.status === "confirmado" && (
                            <>
                              <button
                                className="action-btn cancel-btn"
                                onClick={() => handleStatusUpdate(order.pedido_id, "cancelado")}
                              >
                                <FaBan /> Cancelar
                              </button>
                            </>
                          )}

                          {/* Botões para pedidos com status "cancelado" */}
                          {order.status === "cancelado" && (
                            <button
                              className="action-btn confirm-btn"
                              onClick={() => handleStatusUpdate(order.pedido_id, "confirmado")}
                            >
                              <FaCheck /> Reativar
                            </button>
                          )}

                          <button 
                            className="action-btn delete-btn"
                            onClick={() => abrirModalDeletar(order)}
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

      {/* Modal de Adicionar/Editar Pedido */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content order-modal">
            <div className="modal-header">
              <h2>{pedidoEditando ? 'Editar Pedido' : 'Novo Pedido'}</h2>
              <button className="modal-close" onClick={fecharModais}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="order-form">
              <div className="form-section">
                <h3>Informações do Pedido</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="produto_pedido_id">Produto *</label>
                    <select
                      id="produto_pedido_id"
                      name="produto_pedido_id"
                      value={formData.produto_pedido_id}
                      onChange={handleInputChange}
                      required
                      disabled={loadingProdutos}
                    >
                      <option value="">Selecione o produto</option>
                      {produtosPedido.map(produto => (
                        <option key={produto.produto_pedido_id} value={produto.produto_pedido_id}>
                          {produto.nome} - {formatCurrency(produto.valor)}
                        </option>
                      ))}
                    </select>
                    {loadingProdutos && <p className="loading-text">Carregando produtos...</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cliente_id">Cliente *</label>
                    <select
                      id="cliente_id"
                      name="cliente_id"
                      value={formData.cliente_id}
                      onChange={handleInputChange}
                      required
                      disabled={loadingClientes}
                    >
                      <option value="">Selecione o cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.usuario_id} value={cliente.usuario_id}>
                          {cliente.nome} - {cliente.email}
                        </option>
                      ))}
                    </select>
                    {loadingClientes && <p className="loading-text">Carregando clientes...</p>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="data_hora_entrega">Data e Hora de Entrega *</label>
                    <input
                      type="datetime-local"
                      id="data_hora_entrega"
                      name="data_hora_entrega"
                      value={formData.data_hora_entrega}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status *</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="pendente">Pendente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="observacao">Observações</label>
                  <textarea
                    id="observacao"
                    name="observacao"
                    value={formData.observacao}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Observações sobre o pedido..."
                  />
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
                  {loading ? "Salvando..." : (pedidoEditando ? "Atualizar Pedido" : "Criar Pedido")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetailModal && pedidoEditando && (
        <div className="modal-overlay">
          <div className="modal-content order-modal">
            <div className="modal-header">
              <h2>Detalhes do Pedido</h2>
              <button className="modal-close" onClick={fecharModais}>
                <FaTimes />
              </button>
            </div>

            <div className="order-details-modal">
              {pedidoEditando.items[0]?.foto && (
                <div className="detail-image">
                  <img src={pedidoEditando.items[0].foto} alt={pedidoEditando.items[0].name} />
                </div>
              )}
              
              <div className="detail-info">
                <div className="detail-group">
                  <h3>Informações do Pedido</h3>
                  <p><strong>ID:</strong> {pedidoEditando.id}</p>
                  <p><strong>Total:</strong> {formatCurrency(pedidoEditando.total)}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${getStatusBadge(pedidoEditando.status).class}`}>
                      {getStatusBadge(pedidoEditando.status).label}
                    </span>
                  </p>
                  {pedidoEditando.observacao && (
                    <p><strong>Observações:</strong> {pedidoEditando.observacao}</p>
                  )}
                </div>

                <div className="detail-group">
                  <h3>Produtos</h3>
                  {pedidoEditando.items.map((item, index) => (
                    <div key={index} className="product-detail">
                      <p><strong>{item.name}</strong></p>
                      <p>Quantidade: {item.quantity} | Valor: {formatCurrency(item.price)}</p>
                      {item.categoria && <p>Categoria: {item.categoria}</p>}
                      {item.descricao && <p>Descrição: {item.descricao}</p>}
                    </div>
                  ))}
                </div>

                <div className="detail-group">
                  <h3>Cliente</h3>
                  <p><strong>Nome:</strong> {pedidoEditando.cliente}</p>
                  <p><strong>Email:</strong> {pedidoEditando.cliente_email}</p>
                  <p><strong>Telefone:</strong> {pedidoEditando.cliente_telefone}</p>
                </div>

                <div className="detail-group">
                  <h3>Entrega</h3>
                  <p><strong>Data/Hora:</strong> {formatDateTime(pedidoEditando.data_hora_entrega)}</p>
                  <p><strong>Cadastro:</strong> {formatDateTime(pedidoEditando.data_cadastro)}</p>
                  {pedidoEditando.data_update && (
                    <p><strong>Atualização:</strong> {formatDateTime(pedidoEditando.data_update)}</p>
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
                    abrirModalEditar(pedidoEditando);
                  }}
                >
                  <FaEdit /> Editar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && pedidoParaDeletar && (
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
              <h3>Tem certeza que deseja excluir este pedido?</h3>
              <p><strong>{pedidoParaDeletar.id}</strong></p>
              <p><strong>Cliente:</strong> {pedidoParaDeletar.cliente}</p>
              <p><strong>Total:</strong> {formatCurrency(pedidoParaDeletar.total)}</p>
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

export default OrdersPage;