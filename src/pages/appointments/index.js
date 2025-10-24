import React, { useState, useEffect } from "react";
import SideBar from "../../components/SideBar/index";
import Footer from "../../components/Footer/index";
import { FaTimes, FaCalendar, FaUser, FaPhone, FaEnvelope, FaDollarSign, FaUserTie, FaTrash, FaCheck, FaBan, FaChartLine, FaMoneyBillWave, FaCalendarCheck } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { usePlataforma } from "../../context/PlataformaContext";
import "./styles.css";

function AppointmentsPage() {
  const API_URL = "https://back-pdv-production.up.railway.app/agendamentos";
  const SERVICOS_API_URL = "https://back-pdv-production.up.railway.app/servicos";
  
  // !!! ATENÇÃO: Assumindo que esta é a URL para buscar usuários/clientes !!!
  // !!! Ajuste se necessário !!!
  const CLIENTES_API_URL = "https://back-pdv-production.up.railway.app/usuarios"; 

  const { getAuthHeaders, usuario } = usePlataforma();

  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [clientesDisponiveis, setClientesDisponiveis] = useState([]); // <<< NOVO ESTADO
  const [agendamentoParaDeletar, setAgendamentoParaDeletar] = useState(null);

  const [formData, setFormData] = useState({
    servico_id: "",
    cliente_id: "", // <<< NOVO CAMPO
    dia_marcado: "",
    observacao: "",
  });

  // Carregar serviços, clientes e agendamentos ao montar o componente
  useEffect(() => {
    carregarServicos();
    carregarClientes(); // <<< NOVA FUNÇÃO
    carregarAgendamentos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Adicionei o comentário eslint-disable-line para evitar warnings sobre dependências, 
  // já que getAuthHeaders pode mudar, mas geralmente não queremos recarregar tudo a menos que o usuário mude.
  // Se houver problemas de atualização, adicione [getAuthHeaders] ao array de dependências.

  const carregarServicos = async () => {
    try {
      const response = await axios.get(SERVICOS_API_URL, {
        headers: getAuthHeaders(),
      });
      setServicosDisponiveis(response.data);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      toast.error("Erro ao carregar lista de serviços!");
    }
  };

  // <<< NOVA FUNÇÃO PARA CARREGAR CLIENTES >>>
  const carregarClientes = async () => {
    try {
      const response = await axios.get(CLIENTES_API_URL, {
        headers: getAuthHeaders(),
      });
      // Idealmente, a API deveria permitir filtrar por role=cliente
      // Vamos filtrar aqui por segurança
      const clientes = response.data.filter(u => u.role === 'cliente');
      setClientesDisponiveis(clientes.length > 0 ? clientes : response.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar lista de clientes!");
    }
  };

  const carregarAgendamentos = async () => {
    try {
      setLoadingAgendamentos(true);
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders(),
      });

      const agendamentosMapeados = response.data.map((agendamento) => {
        // ### AJUSTE DA LÓGICA DE MAPEAMENTO ###
        // O cliente agora vem de agendamento.Cliente
        const cliente = agendamento.Cliente || { nome: "Cliente não informado", email: "-", role: "-" };
        
        // O profissional/empresa agora vem de agendamento.Servico.Empresa
        const profissional = agendamento.Servico?.Empresa || { nome: "Profissional não informado", email: "-", role: "-" };
        
        return {
          id: `AGD-${String(agendamento.agendamento_id).padStart(3, "0")}`,
          agendamento_id: agendamento.agendamento_id,
          // Informações do Cliente
          cliente_nome: cliente.nome || "Cliente não informado",
          cliente_email: cliente.email || "-",
          cliente_role: cliente.role || "-",
          // Informações do Profissional/Empresa
          profissional_nome: profissional.nome || "Profissional não informado",
          profissional_email: profissional.email || "-",
          profissional_role: profissional.role || "-",
          // Informações do Serviço
          service: agendamento.Servico?.nome || "Serviço não informado",
          servico_foto: agendamento.Servico?.foto_principal,
          servico_valor: agendamento.Servico?.valor || 0,
          servico_descricao: agendamento.Servico?.descricao || "Sem descrição",
          servico_duracao: agendamento.Servico?.duracao || "Não informada",
          servico_categoria: agendamento.Servico?.categoria || "Sem categoria",
          // Informações do Agendamento
          date: agendamento.dia_marcado,
          time: new Date(agendamento.dia_marcado).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: agendamento.status,
          observacao: agendamento.observacao || "Sem observações",
          data_cadastro: agendamento.data_cadastro,
          data_update: agendamento.data_update,
          // Telefone (mantendo a lógica de extrair da observação, já que o objeto Cliente não o garante)
          phone: agendamento.observacao?.split("| Tel: ")[1]?.split(" |")[0] || "Não informado",
        };
      });

      setAppointments(agendamentosMapeados);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos da API!");
    } finally {
      setLoadingAgendamentos(false);
    }
  };

  // Calcular estatísticas financeiras (NENHUMA MUDANÇA AQUI)
  const calcularEstatisticas = () => {
    // ... (código existente sem alterações)
    const hoje = new Date().toISOString().split('T')[0];
    
    // Faturamento realizado (serviços confirmados)
    const faturamentoRealizado = appointments
      .filter(a => a.status === 'confirmado')
      .reduce((total, a) => total + (a.servico_valor || 0), 0);
    
    // Previsão de faturamento (serviços agendados)
    const previsaoFaturamento = appointments
      .filter(a => a.status === 'agendado')
      .reduce((total, a) => total + (a.servico_valor || 0), 0);
    
    // Agendamentos de hoje
    const agendamentosHoje = appointments.filter(a => 
      a.date.split('T')[0] === hoje
    );
    
    const faturamentoHoje = agendamentosHoje
      .filter(a => a.status === 'confirmado')
      .reduce((total, a) => total + (a.servico_valor || 0), 0);
    
    const previsaoHoje = agendamentosHoje
      .filter(a => a.status === 'agendado')
      .reduce((total, a) => total + (a.servico_valor || 0), 0);

    return {
      faturamentoRealizado,
      previsaoFaturamento,
      faturamentoHoje,
      previsaoHoje,
      agendamentosHoje: agendamentosHoje.length,
      totalAgendamentos: appointments.length,
      agendadosCount: appointments.filter(a => a.status === 'agendado').length,
      confirmadosCount: appointments.filter(a => a.status === 'confirmado').length,
      canceladosCount: appointments.filter(a => a.status === 'cancelado').length,
    };
  };

  // ... (Nenhuma alteração nas funções getStatusBadge, formatCurrency, formatDate, formatDateTime, getRoleLabel) ...
  const estatisticas = calcularEstatisticas();
  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") return true;
    return appointment.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      agendado: { label: "Agendado", class: "status-scheduled" },
      confirmado: { label: "Confirmado", class: "status-confirmed" },
      cancelado: { label: "Cancelado", class: "status-cancelled" },
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

  const getRoleLabel = (role) => {
    const roleLabels = {
      cliente: "Cliente",
      empresa: "Empresa",
      admin: "Administrador"
    };
    return roleLabels[role] || role;
  };

  // ... (Nenhuma alteração em handleStatusUpdate, getStatusText, handleDeleteAppointment, openDeleteModal, closeDeleteModal, handleNewAppointment, handleInputChange)
  const handleStatusUpdate = async (agendamentoId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/${agendamentoId}`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );

      toast.success(`Agendamento ${getStatusText(newStatus)} com sucesso!`, {
        position: "top-right",
        autoClose: 3000,
      });

      await carregarAgendamentos();
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      toast.error("Erro ao atualizar agendamento!");
    }
  };

  const getStatusText = (status) => {
    const statusTexts = {
      confirmado: "confirmado",
      cancelado: "cancelado"
    };
    return statusTexts[status] || "atualizado";
  };

  const handleDeleteAppointment = async () => {
    if (!agendamentoParaDeletar) return;

    setLoading(true);
    try {
      await axios.delete(
        `${API_URL}/${agendamentoParaDeletar.agendamento_id}`,
        { headers: getAuthHeaders() }
      );

      toast.success("Agendamento deletado com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });

      await carregarAgendamentos();
      setShowDeleteModal(false);
      setAgendamentoParaDeletar(null);
    } catch (error) {
      console.error("Erro ao deletar agendamento:", error);
      toast.error("Erro ao deletar agendamento!");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (agendamento) => {
    setAgendamentoParaDeletar(agendamento);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setAgendamentoParaDeletar(null);
  };

  const handleNewAppointment = () => {
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ### AJUSTE NO SUBMIT DO FORMULÁRIO ###
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // O payload agora espera 'cliente_id' e 'status'
      const payload = {
        servico_id: parseInt(formData.servico_id),
        cliente_id: parseInt(formData.cliente_id), // <<< CAMPO ATUALIZADO
        dia_marcado: new Date(formData.dia_marcado).toISOString(),
        observacao: formData.observacao || "",
        status: "agendado", // <<< NOVO CAMPO (conforme payload de exemplo)
      };

      // Validação simples
      if (!payload.servico_id || !payload.cliente_id || !payload.dia_marcado) {
         toast.error("Por favor, preencha Serviço, Cliente e Data/Hora.");
         setLoading(false);
         return;
      }

      await axios.post(API_URL, payload, {
        headers: getAuthHeaders(),
      });

      toast.success("Agendamento criado com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });

      await carregarAgendamentos();

      // Resetar o formulário, incluindo o novo campo cliente_id
      setFormData({
        servico_id: "",
        cliente_id: "", // <<< ATUALIZADO
        dia_marcado: "",
        observacao: "",
      });

      setShowModal(false);
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast.error(
        error.response?.data?.message ||
          "Erro ao criar agendamento. Tente novamente!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        {/* ... (Todo o JSX do header, big-numbers e filtros não precisa de alteração) ... */}
        <div className="appointments-container">
          <ToastContainer />
          <div className="appointments-header">
            <div className="header-title">
              <h1>Agendamentos</h1>
              <p>Gerencie os agendamentos de clientes</p>
            </div>
            <div className="header-actions">
              <button
                className="nav-btn services-btn"
                onClick={() => (window.location.href = "/servicos-prestados")}
              >
                🛠️ Serviços Prestados
              </button>
              <button
                className="new-appointment-btn"
                onClick={handleNewAppointment}
              >
                + Novo Agendamento
              </button>
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
                <span className="big-number-subtitle">Serviços Confirmados</span>
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
                <span className="big-number-subtitle">Serviços Agendados</span>
              </div>
            </div>

            <div className="big-number-card today-card">
              <div className="big-number-icon">
                <FaCalendarCheck />
              </div>
              <div className="big-number-content">
                <span className="big-number-value">
                  {estatisticas.agendamentosHoje}
                </span>
                <span className="big-number-label">Agendamentos Hoje</span>
                <div className="today-details">
                  <span className="today-revenue">
                    Confirmados: {formatCurrency(estatisticas.faturamentoHoje)}
                  </span>
                  <span className="today-forecast">
                    Agendados: {formatCurrency(estatisticas.previsaoHoje)}
                  </span>
                </div>
              </div>
            </div>

            <div className="big-number-card total-card">
              <div className="big-number-icon">
                <FaCalendar />
              </div>
              <div className="big-number-content">
                <span className="big-number-value">
                  {estatisticas.totalAgendamentos}
                </span>
                <span className="big-number-label">Total de Agendamentos</span>
                <div className="status-breakdown">
                  <span className="status-item scheduled">{estatisticas.agendadosCount} agendados</span>
                  <span className="status-item confirmed">{estatisticas.confirmadosCount} confirmados</span>
                  <span className="status-item cancelled">{estatisticas.canceladosCount} cancelados</span>
                </div>
              </div>
            </div>
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
              className={`filter-btn ${filter === "agendado" ? "active" : ""}`}
              onClick={() => setFilter("agendado")}
            >
              Agendados
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

          {/* Lista de Agendamentos (NENHUMA MUDANÇA AQUI) */}
          {/* A lógica de mapeamento em carregarAgendamentos já ajustou os dados, 
              então o JSX de renderização não precisa mudar. */}
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
                  <div key={appointment.agendamento_id} className="appointment-card">
                    <div className="appointment-card-content">
                      {appointment.servico_foto && (
                        <div className="appointment-image">
                          <img
                            src={appointment.servico_foto}
                            alt={appointment.service}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      <div className="appointment-info-container">
                        <div className="appointment-header">
                          <div className="appointment-info">
                            <h3 className="appointment-id">{appointment.id}</h3>
                            <div className="appointment-summary">
                              <span className="appointment-service">
                                {appointment.service}
                              </span>
                              <span className="appointment-value">
                                <FaDollarSign /> {formatCurrency(appointment.servico_valor)}
                              </span>
                            </div>
                          </div>
                          <div className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.label}
                          </div>
                        </div>

                      
                        

                        <div className="appointment-details">
                          <div className="customer-info">
                            <h4><FaUser /> Cliente</h4>
                            <p><strong>Nome:</strong> {appointment.cliente_nome}</p>
                            <p><FaEnvelope /> <strong>Email:</strong> {appointment.cliente_email}</p>
                            <p><FaPhone /> <strong>Telefone:</strong> {appointment.phone}</p>
                            <p><strong>Tipo:</strong> {getRoleLabel(appointment.cliente_role)}</p>
                          </div>

                          <div className="professional-info">
                            <h4><FaUserTie /> Profissional</h4>
                            <p><strong>Nome:</strong> {appointment.profissional_nome}</p>
                            <p><FaEnvelope /> <strong>Email:</strong> {appointment.profissional_email}</p>
                            <p><strong>Tipo:</strong> {getRoleLabel(appointment.profissional_role)}</p>
                          </div>

                          <div className="schedule-info">
                            <h4><FaCalendar /> Agendamento</h4>
                            <div className="schedule-details">
                              <div className="date-time">
                                <span className="date">
                                  {formatDate(appointment.date)}
                                </span>
                                <span className="time">{appointment.time}</span>
                              </div>
                              <p><strong>Status:</strong> {statusInfo.label}</p>
                              <p><strong>Cadastro:</strong> {formatDateTime(appointment.data_cadastro)}</p>
                              {appointment.data_update && (
                                <p><strong>Atualização:</strong> {formatDateTime(appointment.data_update)}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {appointment.observacao && appointment.observacao !== "Sem observações" && (
                          <div className="notes-section">
                            <h4>Observações</h4>
                            <p className="notes">{appointment.observacao}</p>
                          </div>
                        )}

                        <div className="appointment-actions">
                          {/* Botões para agendamentos com status "agendado" */}
                          {appointment.status === "agendado" && (
                            <>
                              <button
                                className="action-btn confirm-btn"
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointment.agendamento_id,
                                    "confirmado"
                                  )
                                }
                              >
                                <FaCheck /> Confirmar
                              </button>
                              <button
                                className="action-btn cancel-btn"
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointment.agendamento_id,
                                    "cancelado"
                                  )
                                }
                              >
                                <FaBan /> Cancelar
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => openDeleteModal(appointment)}
                              >
                                <FaTrash /> Excluir
                              </button>
                            </>
                          )}

                          {/* Botões para agendamentos com status "confirmado" */}
                          {appointment.status === "confirmado" && (
                            <>
                              <button
                                className="action-btn cancel-btn"
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointment.agendamento_id,
                                    "cancelado"
                                  )
                                }
                              >
                                <FaBan /> Cancelar
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => openDeleteModal(appointment)}
                              >
                                <FaTrash /> Excluir
                              </button>
                            </>
                          )}

                          {/* Botões para agendamentos com status "cancelado" */}
                          {appointment.status === "cancelado" && (
                            <>
                              <button
                                className="action-btn confirm-btn"
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointment.agendamento_id,
                                    "confirmado"
                                  )
                                }
                              >
                                {/* O texto "Reagendar" pode ser confuso, 
                                    talvez "Reativar" ou "Confirmar" seja melhor?
                                    Mantendo "Reagendar" por enquanto. */}
                                <FaCheck /> Reagendar
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => openDeleteModal(appointment)}
                              >
                                <FaTrash /> Excluir
                              </button>
                            </>
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

      {/* ### AJUSTE NO MODAL DE NOVO AGENDAMENTO ### */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content appointment-modal">
            <div className="modal-header">
              <h2>Novo Agendamento</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="appointment-form">
              <div className="form-section">
                <h3>
                  <FaCalendar /> Detalhes do Agendamento
                </h3>

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
                    {servicosDisponiveis.map((servico) => (
                      <option
                        key={servico.servico_id}
                        value={servico.servico_id}
                      >
                        {servico.nome} - {formatCurrency(servico.valor)} - {servico.duracao || 'Duração não informada'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <<< NOVO CAMPO DE SELEÇÃO DE CLIENTE >>> */}
                <div className="form-group">
                  <label htmlFor="cliente_id">Cliente *</label>
                  <select
                    id="cliente_id"
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o cliente</option>
                    {clientesDisponiveis.map((cliente) => (
                      <option
                        key={cliente.usuario_id}
                        value={cliente.usuario_id}
                      >
                        {cliente.nome} ({cliente.email || 'sem email'})
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
                    placeholder="Ex: Cliente prefere horário da manhã..."
                  />
                  <small className="form-help">
                    {/* O telefone agora vem do cadastro do cliente, 
                        mas a observação ainda é útil. */}
                    Observações gerais sobre o agendamento.
                  </small>
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
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Salvando..." : "Criar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão (NENHUMA MUDANÇA AQUI) */}
      {showDeleteModal && agendamentoParaDeletar && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h2>Confirmar Exclusão</h2>
              <button className="modal-close" onClick={closeDeleteModal}>
                <FaTimes />
              </button>
            </div>

            <div className="delete-content">
              <div className="warning-icon">
                <FaTrash />
              </div>
              <h3>Tem certeza que deseja excluir este agendamento?</h3>
              <p><strong>{agendamentoParaDeletar.service}</strong></p>
              <p><strong>Cliente:</strong> {agendamentoParaDeletar.cliente_nome}</p>
              <p><strong>Data:</strong> {formatDate(agendamentoParaDeletar.date)} às {agendamentoParaDeletar.time}</p>
              <p><strong>Valor:</strong> {formatCurrency(agendamentoParaDeletar.servico_valor)}</p>
              <p className="warning-text">Esta ação não pode ser desfeita!</p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={closeDeleteModal}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={handleDeleteAppointment}
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

export default AppointmentsPage;