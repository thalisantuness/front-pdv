// pages/services-provided/index.js
import React, { useState, useEffect } from "react";
import SideBar from "../../components/SideBar/index";
import Footer from "../../components/Footer/index";
import { FaPlus, FaTimes, FaSearch, FaCalendar, FaDollarSign, FaUser, FaCheckCircle, FaImage, FaCheck } from "react-icons/fa";
import "./styles.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useImovel } from "../../context/ImovelContext";

function ServicesProvidedPage() {
  const API_URL = "https://back-pdv-production.up.railway.app/servicos";
  
  const [filter, setFilter] = useState("all"); // all, this_week, this_month, last_month
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingServicos, setLoadingServicos] = useState(true);
  
  const { getAuthHeaders, isAuthenticated, usuario } = useImovel();
  
  const [formData, setFormData] = useState({
    servico: "",
    valor: "",
    foto_principal: ""
  });

  // Estado para armazenar os serviços vindos da API
  const [servicos, setServicos] = useState([]);

  const carregarServicos = async () => {
    try {
      setLoadingServicos(true);
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders()
      });

      // Mapear os dados da API para o formato esperado na interface
      const servicosMapeados = response.data.map(servico => ({
        id: `SRV-${String(servico.servico_id).padStart(3, '0')}`,
        cliente: "Cliente não informado", // A API não retorna informações de cliente
        telefone: "-",
        email: "-",
        servico: servico.nome,
        valor: servico.valor,
        data: servico.data_cadastro,
        duracao: "-",
        status: "concluido",
        pagamento: "pendente",
        observacoes: "Serviço cadastrado",
        foto_principal: servico.foto_principal
      }));

      setServicos(servicosMapeados);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      toast.error("Erro ao carregar serviços da API!");
    } finally {
      setLoadingServicos(false);
    }
  };

  // Carregar serviços da API ao montar o componente
  useEffect(() => {
    carregarServicos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredServicos = servicos.filter(servico => {
    const matchesSearch = servico.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.servico.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    
    const servicoDate = new Date(servico.data);
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    if (filter === "this_week") return matchesSearch && servicoDate >= oneWeekAgo;
    if (filter === "this_month") return matchesSearch && servicoDate >= oneMonthAgo;
    if (filter === "last_month") return matchesSearch && servicoDate >= twoMonthsAgo && servicoDate < oneMonthAgo;
    
    return matchesSearch;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
      // Validar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB!");
        return;
      }

      // Validar tipo de arquivo
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
        nome: formData.servico,
        valor: parseFloat(formData.valor),
        foto_principal: formData.foto_principal || "",
        usuario_id: usuario.usuario_id
      };

      // Fazer requisição POST para criar o serviço
      await axios.post(API_URL, payload, {
        headers: getAuthHeaders()
      });
      
      toast.success("Serviço cadastrado com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Recarregar a lista de serviços
      await carregarServicos();

      // Limpar formulário
      setFormData({
        servico: "",
        valor: "",
        foto_principal: ""
      });

      setShowModal(false);
    } catch (error) {
      console.error("Erro ao cadastrar serviço:", error);
      toast.error("Erro ao cadastrar serviço. Tente novamente!");
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const totalServicos = servicos.length;
  const totalFaturamento = servicos.reduce((sum, s) => sum + s.valor, 0);
  const servicosPagos = servicos.filter(s => s.pagamento === "pago").length;
  const servicosPendentes = servicos.filter(s => s.pagamento === "pendente").length;
  const faturamentoPendente = servicos
    .filter(s => s.pagamento === "pendente")
    .reduce((sum, s) => sum + s.valor, 0);

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <div className="services-container">
          <ToastContainer />
          
          {/* Header */}
          <div className="services-header">
            <div className="header-title">
              <h1>Serviços Prestados</h1>
              <p>Gerencie e acompanhe todos os serviços realizados</p>
            </div>
            <button 
              className="new-service-btn"
              onClick={() => setShowModal(true)}
            >
              <FaPlus /> Novo Serviço
            </button>
          </div>

          {/* Estatísticas */}
          <div className="services-stats">
            <div className="stat-card total">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <span className="stat-number">{totalServicos}</span>
                <span className="stat-label">Total de Serviços</span>
              </div>
            </div>
            
            <div className="stat-card revenue">
              <div className="stat-icon">
                <FaDollarSign />
              </div>
              <div className="stat-content">
                <span className="stat-number">{formatCurrency(totalFaturamento)}</span>
                <span className="stat-label">Faturamento Total</span>
              </div>
            </div>
            
            <div className="stat-card paid">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <span className="stat-number">{servicosPagos}</span>
                <span className="stat-label">Serviços Pagos</span>
              </div>
            </div>
            
            <div className="stat-card pending">
              <div className="stat-icon">
                <FaDollarSign />
              </div>
              <div className="stat-content">
                <span className="stat-number">{formatCurrency(faturamentoPendente)}</span>
                <span className="stat-label">Pagamentos Pendentes</span>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="services-controls">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por cliente, serviço ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="services-filters">
              <button 
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Todos
              </button>
              <button 
                className={`filter-btn ${filter === "this_week" ? "active" : ""}`}
                onClick={() => setFilter("this_week")}
              >
                Esta Semana
              </button>
              <button 
                className={`filter-btn ${filter === "this_month" ? "active" : ""}`}
                onClick={() => setFilter("this_month")}
              >
                Este Mês
              </button>
              <button 
                className={`filter-btn ${filter === "last_month" ? "active" : ""}`}
                onClick={() => setFilter("last_month")}
              >
                Mês Passado
              </button>
            </div>
          </div>

          {/* Lista de Serviços */}
          <div className="services-list">
            {loadingServicos ? (
              <div className="no-services">
                <p>Carregando serviços...</p>
              </div>
            ) : filteredServicos.length === 0 ? (
              <div className="no-services">
                <p>Nenhum serviço encontrado</p>
              </div>
            ) : (
              filteredServicos.map((servico) => (
                <div key={servico.id} className="service-card">
                  <div className="service-card-content">
                    {servico.foto_principal && (
                      <div className="service-image">
                        <img 
                          src={servico.foto_principal} 
                          alt={servico.servico}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="service-info-container">
                      <div className="service-header">
                        <div className="service-info">
                          <h3 className="service-id">{servico.id}</h3>
                          <span className="service-name">{servico.servico}</span>
                        </div>
                        <div className="service-badges">
                          <span className={`payment-badge ${servico.pagamento}`}>
                            {servico.pagamento === "pago" ? "Pago" : "Pendente"}
                          </span>
                          <span className="value-badge">{formatCurrency(servico.valor)}</span>
                        </div>
                      </div>

                      <div className="service-details">
                        <div className="customer-info">
                          <h4><FaUser /> Cliente</h4>
                          <p><strong>{servico.cliente}</strong></p>
                          <p>{servico.telefone}</p>
                          <p>{servico.email}</p>
                        </div>

                        <div className="service-date-info">
                          <h4><FaCalendar /> Data e Duração</h4>
                          <div className="date-details">
                            <span className="date">{formatDate(servico.data)}</span>
                            <span className="duration">Duração: {servico.duracao}</span>
                          </div>
                        </div>

                        <div className="service-notes">
                          <h4>Observações</h4>
                          <p className="notes">{servico.observacoes}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <Footer />
      </div>

      {/* Modal de Novo Serviço */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content service-modal">
            <div className="modal-header">
              <h2>Novo Serviço Prestado</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="service-form">
              <div className="form-section">
                <h3>Informações do Serviço</h3>
                
                <div className="form-group">
                  <label htmlFor="servico">Nome do Serviço *</label>
                  <input
                    type="text"
                    id="servico"
                    name="servico"
                    value={formData.servico}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Banho e Tosa, Consultoria, etc."
                  />
                </div>

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
                  <label htmlFor="foto">
                    <FaImage /> Foto do Serviço (opcional)
                  </label>
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
                    {formData.foto_principal && (
                      <span className="file-upload-status">
                        <FaCheck className="success-icon" /> Foto selecionada
                      </span>
                    )}
                  </label>
                  {formData.foto_principal && (
                    <div className="image-preview">
                      <img src={formData.foto_principal} alt="Preview do serviço" />
                    </div>
                  )}
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
                  {loading ? "Salvando..." : "Cadastrar Serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicesProvidedPage;

