// pages/orders/index.js
import React, { useState, useEffect } from "react";
import SideBar from "../../components/SideBar/index";
import Footer from "../../components/Footer/index";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useImovel } from "../../context/ImovelContext";
import "./styles.css";

function OrdersPage() {
  const API_URL = "https://back-pdv-production.up.railway.app/pedidos";
  const PRODUTOS_PEDIDO_API_URL = "https://back-pdv-production.up.railway.app/produtos-pedido";
  
  const { getAuthHeaders } = useImovel();
  
  const [filter, setFilter] = useState("all"); // all, pending, completed, cancelled
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Carregar pedidos ao montar o componente
  useEffect(() => {
    carregarPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarPedidos = async () => {
    try {
      setLoadingOrders(true);
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders()
      });

      // Mapear os dados da API para o formato esperado
      const pedidosMapeados = response.data.map(pedido => ({
        id: `ORD-${String(pedido.pedido_id).padStart(3, '0')}`,
        pedido_id: pedido.pedido_id,
        customer: "Cliente não informado",
        email: "-",
        phone: "-",
        items: [
          {
            name: pedido.ProdutoPedido?.nome || "Produto não informado",
            quantity: 1,
            price: pedido.ProdutoPedido?.valor || 0,
            foto: pedido.ProdutoPedido?.foto_principal
          }
        ],
        total: pedido.ProdutoPedido?.valor || 0,
        status: pedido.status,
        date: pedido.data_hora_entrega,
        payment: "-",
        observacao: pedido.observacao || "Sem observações",
        data_cadastro: pedido.data_cadastro
      }));

      setOrders(pedidosMapeados);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar pedidos da API!");
    } finally {
      setLoadingOrders(false);
    }
  };


  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Pendente", class: "status-pending" },
      completed: { label: "Concluído", class: "status-completed" },
      cancelled: { label: "Cancelado", class: "status-cancelled" }
    };
    return statusConfig[status] || { label: status, class: "status-default" };
  };

  const getPaymentMethod = (payment) => {
    const methods = {
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      pix: "PIX",
      boleto: "Boleto"
    };
    return methods[payment] || payment;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleStatusUpdate = async (pedidoId, newStatus) => {
    try {
      // Mapear status do frontend para o backend
      const statusMap = {
        "completed": "concluido",
        "cancelled": "cancelado",
        "pending": "pendente"
      };

      const statusBackend = statusMap[newStatus] || newStatus;

      // Fazer requisição PATCH para atualizar o status
      await axios.patch(`${API_URL}/${pedidoId}`, 
        { status: statusBackend },
        { headers: getAuthHeaders() }
      );

      toast.success(`Pedido atualizado com sucesso!`, {
        position: "top-right",
        autoClose: 3000,
      });

      // Recarregar pedidos
      await carregarPedidos();
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast.error("Erro ao atualizar pedido!");
    }
  };

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <div className="orders-container">
          <ToastContainer />
          <div className="orders-header">
            <h1>Pedidos do E-commerce</h1>
            <p>Gerencie os pedidos realizados pela loja online</p>
          </div>

          {/* Filtros */}
          <div className="orders-filters">
            <button 
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Todos
            </button>
            <button 
              className={`filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pendentes
            </button>
            <button 
              className={`filter-btn ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Concluídos
            </button>
            <button 
              className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
              onClick={() => setFilter("cancelled")}
            >
              Cancelados
            </button>
          </div>

          {/* Estatísticas */}
          <div className="orders-stats">
            <div className="stat-card">
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">Total de Pedidos</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {orders.filter(o => o.status === 'pending').length}
              </span>
              <span className="stat-label">Pendentes</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {orders.filter(o => o.status === 'completed').length}
              </span>
              <span className="stat-label">Concluídos</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {formatCurrency(orders.reduce((total, order) => total + order.total, 0))}
              </span>
              <span className="stat-label">Valor Total</span>
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
                  <div key={order.id} className="order-card">
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
                            <span className="order-date">{formatDate(order.date)}</span>
                          </div>
                          <div className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.label}
                          </div>
                        </div>

                        <div className="order-details">
                          <div className="customer-info">
                            <h4>Cliente</h4>
                            <p><strong>{order.customer}</strong></p>
                            <p>{order.email}</p>
                            <p>{order.phone}</p>
                          </div>

                          <div className="items-info">
                            <h4>Itens do Pedido</h4>
                            {order.items.map((item, index) => (
                              <div key={index} className="order-item">
                                <span className="item-name">{item.name}</span>
                                <span className="item-quantity">Qtd: {item.quantity}</span>
                                <span className="item-price">{formatCurrency(item.price)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="payment-info">
                            <h4>Entrega e Observações</h4>
                            <p><strong>Data/Hora Entrega:</strong> {formatDate(order.date)}</p>
                            <p><strong>Observação:</strong> {order.observacao}</p>
                            <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                          </div>
                        </div>

                        <div className="order-actions">
                          {order.status === "pendente" && (
                            <>
                              <button 
                                className="action-btn complete-btn"
                                onClick={() => handleStatusUpdate(order.pedido_id, "completed")}
                              >
                                Marcar como Concluído
                              </button>
                              <button 
                                className="action-btn cancel-btn"
                                onClick={() => handleStatusUpdate(order.pedido_id, "cancelled")}
                              >
                                Cancelar Pedido
                              </button>
                            </>
                          )}
                          {order.status === "concluido" && (
                            <span className="status-completed-info">
                              Pedido concluído
                            </span>
                          )}
                          {order.status === "cancelado" && (
                            <span className="status-completed-info">
                              Pedido cancelado
                            </span>
                          )}
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
    </div>
  );
}

export default OrdersPage;