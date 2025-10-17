// pages/orders/index.js
import React, { useState } from "react";
import NavBar from "../../components/NavBar/index";
import Footer from "../../components/Footer/index";
import "./styles.css";

function OrdersPage() {
  const [filter, setFilter] = useState("all"); // all, pending, completed, cancelled

  // Dados fictícios de pedidos
  const orders = [
    {
      id: "ORD-001",
      customer: "João Silva",
      email: "joao.silva@email.com",
      phone: "(11) 99999-9999",
      items: [
        { name: "Camisa Flamengo I 2024", quantity: 2, price: 299.90 },
        { name: "Short Flamengo", quantity: 1, price: 149.90 }
      ],
      total: 749.70,
      status: "pending",
      date: "2024-03-20 14:30",
      payment: "credit_card"
    },
    {
      id: "ORD-002",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "(11) 98888-8888",
      items: [
        { name: "Camisa Corinthians II 2024", quantity: 1, price: 349.90 }
      ],
      total: 349.90,
      status: "completed",
      date: "2024-03-19 10:15",
      payment: "pix"
    },
    {
      id: "ORD-003",
      customer: "Pedro Oliveira",
      email: "pedro.oliveira@email.com",
      phone: "(11) 97777-7777",
      items: [
        { name: "Camisa São Paulo III", quantity: 3, price: 279.90 },
        { name: "Meião São Paulo", quantity: 2, price: 89.90 }
      ],
      total: 1019.50,
      status: "pending",
      date: "2024-03-20 16:45",
      payment: "debit_card"
    },
    {
      id: "ORD-004",
      customer: "Ana Costa",
      email: "ana.costa@email.com",
      phone: "(11) 96666-6666",
      items: [
        { name: "Camisa Palmeiras", quantity: 1, price: 319.90 }
      ],
      total: 319.90,
      status: "cancelled",
      date: "2024-03-18 09:20",
      payment: "credit_card"
    }
  ];

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

  const handleStatusUpdate = (orderId, newStatus) => {
    // Aqui você implementaria a atualização no backend
    console.log(`Atualizando pedido ${orderId} para status: ${newStatus}`);
    alert(`Pedido ${orderId} atualizado para: ${newStatus}`);
  };

  return (
    <div className="container">
      <NavBar />
      <div className="main-content">
        <div className="orders-container">
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
            {filteredOrders.length === 0 ? (
              <div className="no-orders">
                <p>Nenhum pedido encontrado</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusInfo = getStatusBadge(order.status);
                return (
                  <div key={order.id} className="order-card">
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
                        <h4>Pagamento</h4>
                        <p><strong>Método:</strong> {getPaymentMethod(order.payment)}</p>
                        <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                      </div>
                    </div>

                    <div className="order-actions">
                      {order.status === "pending" && (
                        <>
                          <button 
                            className="action-btn complete-btn"
                            onClick={() => handleStatusUpdate(order.id, "completed")}
                          >
                            Marcar como Concluído
                          </button>
                          <button 
                            className="action-btn cancel-btn"
                            onClick={() => handleStatusUpdate(order.id, "cancelled")}
                          >
                            Cancelar Pedido
                          </button>
                        </>
                      )}
                      {order.status === "completed" && (
                        <button className="action-btn details-btn">
                          Ver Detalhes
                        </button>
                      )}
                      {order.status === "cancelled" && (
                        <button className="action-btn details-btn">
                          Ver Motivo
                        </button>
                      )}
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