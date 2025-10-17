// pages/appointments/index.js
import React, { useState } from "react";
import NavBar from "../../components/NavBar/index";
import Footer from "../../components/Footer/index";
import "./styles.css";

function AppointmentsPage() {
  const [filter, setFilter] = useState("all"); // all, scheduled, completed, cancelled

  // Dados fictícios de agendamentos
  const appointments = [
    {
      id: "AGD-001",
      customer: "Carlos Santos",
      phone: "(11) 95555-5555",
      email: "carlos.santos@email.com",
      service: "Prova de Camisas",
      date: "2024-03-22",
      time: "14:00",
      duration: "30 min",
      status: "scheduled",
      notes: "Cliente quer provar camisas do Flamengo e Corinthians"
    },
    {
      id: "AGD-002",
      customer: "Ana Paula Lima",
      phone: "(11) 94444-4444",
      email: "ana.lima@email.com",
      service: "Retirada de Pedido",
      date: "2024-03-21",
      time: "10:30",
      duration: "15 min",
      status: "completed",
      notes: "Pedido ORD-002 - Camisas já separadas"
    },
    {
      id: "AGD-003",
      customer: "Roberto Silva",
      phone: "(11) 93333-3333",
      email: "roberto.silva@email.com",
      service: "Consulta de Tamanhos",
      date: "2024-03-23",
      time: "16:00",
      duration: "45 min",
      status: "scheduled",
      notes: "Cliente tem dúvidas sobre tamanhos infantis"
    },
    {
      id: "AGD-004",
      customer: "Mariana Costa",
      phone: "(11) 92222-2222",
      email: "mariana.costa@email.com",
      service: "Troca de Produto",
      date: "2024-03-20",
      time: "11:00",
      duration: "20 min",
      status: "cancelled",
      notes: "Cliente cancelou - Problema de agenda"
    }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === "all") return true;
    return appointment.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { label: "Agendado", class: "status-scheduled" },
      completed: { label: "Concluído", class: "status-completed" },
      cancelled: { label: "Cancelado", class: "status-cancelled" }
    };
    return statusConfig[status] || { label: status, class: "status-default" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleStatusUpdate = (appointmentId, newStatus) => {
    // Aqui você implementaria a atualização no backend
    console.log(`Atualizando agendamento ${appointmentId} para status: ${newStatus}`);
    alert(`Agendamento ${appointmentId} atualizado para: ${newStatus}`);
  };

  const handleNewAppointment = () => {
    // Aqui você implementaria a criação de novo agendamento
    alert("Abrir modal de novo agendamento");
  };

  return (
    <div className="container">
      <NavBar />
      <div className="main-content">
        <div className="appointments-container">
          <div className="appointments-header">
            <div className="header-title">
              <h1>Agendamentos</h1>
              <p>Gerencie os agendamentos de clientes</p>
            </div>
            <button 
              className="new-appointment-btn"
              onClick={handleNewAppointment}
            >
              + Novo Agendamento
            </button>
          </div>

          {/* Filtros */}
          <div className="appointments-filters">
            <button 
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Todos
            </button>
            <button 
              className={`filter-btn ${filter === "scheduled" ? "active" : ""}`}
              onClick={() => setFilter("scheduled")}
            >
              Agendados
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
          <div className="appointments-stats">
            <div className="stat-card">
              <span className="stat-number">{appointments.length}</span>
              <span className="stat-label">Total de Agendamentos</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {appointments.filter(a => a.status === 'scheduled').length}
              </span>
              <span className="stat-label">Agendados</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {appointments.filter(a => a.status === 'completed').length}
              </span>
              <span className="stat-label">Concluídos</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                Hoje: {appointments.filter(a => a.date === '2024-03-20').length}
              </span>
              <span className="stat-label">Para Hoje</span>
            </div>
          </div>

          {/* Lista de Agendamentos */}
          <div className="appointments-list">
            {filteredAppointments.length === 0 ? (
              <div className="no-appointments">
                <p>Nenhum agendamento encontrado</p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => {
                const statusInfo = getStatusBadge(appointment.status);
                return (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-header">
                      <div className="appointment-info">
                        <h3 className="appointment-id">{appointment.id}</h3>
                        <span className="appointment-service">{appointment.service}</span>
                      </div>
                      <div className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.label}
                      </div>
                    </div>

                    <div className="appointment-details">
                      <div className="customer-info">
                        <h4>Cliente</h4>
                        <p><strong>{appointment.customer}</strong></p>
                        <p>{appointment.phone}</p>
                        <p>{appointment.email}</p>
                      </div>

                      <div className="schedule-info">
                        <h4>Data e Horário</h4>
                        <div className="schedule-details">
                          <div className="date-time">
                            <span className="date">{formatDate(appointment.date)}</span>
                            <span className="time">{appointment.time}</span>
                          </div>
                          <span className="duration">Duração: {appointment.duration}</span>
                        </div>
                      </div>

                      <div className="notes-info">
                        <h4>Observações</h4>
                        <p className="notes">{appointment.notes}</p>
                      </div>
                    </div>

                    <div className="appointment-actions">
                      {appointment.status === "scheduled" && (
                        <>
                          <button 
                            className="action-btn complete-btn"
                            onClick={() => handleStatusUpdate(appointment.id, "completed")}
                          >
                            Marcar como Concluído
                          </button>
                          <button 
                            className="action-btn cancel-btn"
                            onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                          >
                            Cancelar
                          </button>
                          <button className="action-btn edit-btn">
                            Reagendar
                          </button>
                        </>
                      )}
                      {(appointment.status === "completed" || appointment.status === "cancelled") && (
                        <button className="action-btn details-btn">
                          Ver Detalhes
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

export default AppointmentsPage;