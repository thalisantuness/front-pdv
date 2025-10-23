// pages/appointments/index.js
import React, { useState, useEffect } from "react";
import SideBar from "../../components/SideBar/index";
import Footer from "../../components/Footer/index";
import { FaTimes, FaCalendar } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useImovel } from "../../context/ImovelContext";
import "./styles.css";

function AppointmentsPage() {
  const API_URL = "https://back-pdv-production.up.railway.app/agendamentos";
  const SERVICOS_API_URL = "https://back-pdv-production.up.railway.app/servicos";
  
  const { getAuthHeaders, usuario } = useImovel();
  
  const [filter, setFilter] = useState("all"); // all, scheduled, completed, cancelled
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  
  const [formData, setFormData] = useState({
    servico_id: "",
    dia_marcado: "",
    observacao: ""
  });

  // Carregar serviços e agendamentos ao montar o componente
  useEffect(() => {
    carregarServicos();
    carregarAgendamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarServicos = async () => {
    try {
      const response = await axios.get(SERVICOS_API_URL, {
        headers: getAuthHeaders()
      });
      setServicosDisponiveis(response.data);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      toast.error("Erro ao carregar lista de serviços!");
    }
  };

  const carregarAgendamentos = async () => {
    try {
      setLoadingAgendamentos(true);
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders()
      });

      // Mapear os dados da API para o formato esperado
      const agendamentosMapeados = response.data.map(agendamento => ({
        id: `AGD-${String(agendamento.agendamento_id).padStart(3, '0')}`,
        agendamento_id: agendamento.agendamento_id,
        customer: agendamento.Cliente?.nome || "Cliente não informado",
        phone: "-",
        email: agendamento.Cliente?.email || "-",
        service: agendamento.Servico?.nome || "Serviço não informado",
        servico_foto: agendamento.Servico?.foto_principal,
        servico_valor: agendamento.Servico?.valor,
        empresa_nome: agendamento.Servico?.Empresa?.nome,
        date: agendamento.dia_marcado,
        time: new Date(agendamento.dia_marcado).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: "-",
        status: agendamento.status === "agendado" ? "scheduled" : 
                agendamento.status === "concluido" ? "completed" : "cancelled",
        notes: agendamento.observacao || "Sem observações"
      }));

      setAppointments(agendamentosMapeados);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos da API!");
    } finally {
      setLoadingAgendamentos(false);
    }
  };


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

  const handleStatusUpdate = async (agendamentoId, newStatus) => {
    try {
      // Mapear status do frontend para o backend
      const statusMap = {
        "completed": "concluido",
        "cancelled": "cancelado"
      };

      const statusBackend = statusMap[newStatus] || newStatus;

      // Fazer requisição PATCH para atualizar o status
      await axios.patch(`${API_URL}/${agendamentoId}`, 
        { status: statusBackend },
        { headers: getAuthHeaders() }
      );

      toast.success(`Agendamento atualizado com sucesso!`, {
      position: "top-right",
      autoClose: 3000,
    });

      // Recarregar agendamentos
      await carregarAgendamentos();
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      toast.error("Erro ao atualizar agendamento!");
    }
  };

  const handleNewAppointment = () => {
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar se tem usuário logado
      if (!usuario || !usuario.usuario_id) {
        toast.error("Usuário não autenticado!");
        setLoading(false);
        return;
      }

      // Criar payload para a API
      const payload = {
        servico_id: parseInt(formData.servico_id),
        usuario_id: usuario.usuario_id,
        dia_marcado: new Date(formData.dia_marcado).toISOString(),
        observacao: formData.observacao || ""
      };

      // Fazer requisição POST para criar o agendamento
      await axios.post(API_URL, payload, {
        headers: getAuthHeaders()
      });

      toast.success("Agendamento criado com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Recarregar a lista de agendamentos
      await carregarAgendamentos();

      // Limpar formulário
      setFormData({
        servico_id: "",
        dia_marcado: "",
        observacao: ""
      });

      setShowModal(false);
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast.error(error.response?.data?.message || "Erro ao criar agendamento. Tente novamente!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <div className="appointments-container">
          <ToastContainer />
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
            {loadingAgendamentos ? (
              <div className="no-appointments">
                <p>Carregando agendamentos...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="no-appointments">
                <p>Nenhum agendamento encontrado</p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => {
                const statusInfo = getStatusBadge(appointment.status);
                return (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-card-content">
                      {appointment.servico_foto && (
                        <div className="appointment-image">
                          <img 
                            src={appointment.servico_foto} 
                            alt={appointment.service}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="appointment-info-container">
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
                                onClick={() => handleStatusUpdate(appointment.agendamento_id, "completed")}
                          >
                            Marcar como Concluído
                          </button>
                          <button 
                            className="action-btn cancel-btn"
                                onClick={() => handleStatusUpdate(appointment.agendamento_id, "cancelled")}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {(appointment.status === "completed" || appointment.status === "cancelled") && (
                            <span className="status-completed-info">
                              Agendamento {appointment.status === "completed" ? "concluído" : "cancelado"}
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

      {/* Modal de Novo Agendamento */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content appointment-modal">
            <div className="modal-header">
              <h2>Novo Agendamento</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="appointment-form">
              <div className="form-section">
                <h3><FaCalendar /> Detalhes do Agendamento</h3>
                
                <div className="form-group">
                  <label htmlFor="servico_id">Tipo de Serviço *</label>
                  <select
                    id="servico_id"
                    name="servico_id"
                    value={formData.servico_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o serviço</option>
                    {servicosDisponiveis.map(servico => (
                      <option key={servico.servico_id} value={servico.servico_id}>
                        {servico.nome} - R$ {servico.valor.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dia_marcado">Data e Hora *</label>
                  <input
                    type="datetime-local"
                    id="dia_marcado"
                    name="dia_marcado"
                    value={formData.dia_marcado}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="observacao">Observações</label>
                  <textarea
                    id="observacao"
                    name="observacao"
                    value={formData.observacao}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Ex: Levar nota fiscal, trazer documento, etc..."
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Criar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;