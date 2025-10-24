import React, { useState, useEffect } from "react";
import SideBar from "../../components/SideBar/index";
import Footer from "../../components/Footer/index";
import { FaPlus, FaTimes, FaSearch, FaCalendar, FaDollarSign, FaUser, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import "./styles.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { usePlataforma } from "../../context/PlataformaContext";

function ServicesProvidedPage() {
  const API_URL = "https://back-pdv-production.up.railway.app/servicos";
  const USUARIOS_API_URL = "https://back-pdv-production.up.railway.app/usuarios";
  
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingServicos, setLoadingServicos] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [servicoParaDeletar, setServicoParaDeletar] = useState(null);
  
  const { getAuthHeaders, usuario: usuarioLogado } = usePlataforma();
  
  const [formData, setFormData] = useState({
    servico: "",
    valor: "",
    foto_principal: "",
    empresa_id: ""
  });

  const [servicoEditando, setServicoEditando] = useState(null);
  const [servicos, setServicos] = useState([]);

  // Carregar lista de usuários (empresas/admins)
  const carregarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await axios.get(USUARIOS_API_URL, {
        headers: getAuthHeaders()
      });

      // Filtrar usuários baseado na role do usuário logado
      let usuariosFiltrados = [];
      
      if (usuarioLogado?.role === "admin") {
        // Admin pode ver admin e empresa
        usuariosFiltrados = response.data.filter(user => 
          user.role === "admin" || user.role === "empresa"
        );
      } else if (usuarioLogado?.role === "empresa") {
        // Empresa só pode ver outros usuários com role empresa
        usuariosFiltrados = response.data.filter(user => 
          user.role === "empresa"
        );
      }

      setUsuarios(usuariosFiltrados);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar lista de usuários!");
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const carregarServicos = async () => {
    try {
      setLoadingServicos(true);
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders()
      });

      const servicosMapeados = response.data.map(servico => ({
        id: `SRV-${String(servico.servico_id).padStart(3, '0')}`,
        servico_id: servico.servico_id,
        nome: servico.nome,
        valor: servico.valor,
        foto_principal: servico.foto_principal,
        data_cadastro: servico.data_cadastro,
        data_update: servico.data_update,
        empresa_nome: servico.Empresa?.nome || "Empresa não informada",
        empresa_role: servico.Empresa?.role || "-",
        empresa_id: servico.empresa_id
      }));

      setServicos(servicosMapeados);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      toast.error("Erro ao carregar serviços da API!");
    } finally {
      setLoadingServicos(false);
    }
  };

  useEffect(() => {
    carregarServicos();
  }, []);

  // Quando abrir o modal, carregar a lista de usuários
  useEffect(() => {
    if (showModal) {
      carregarUsuarios();
      
      // Se for empresa, definir o próprio usuário como padrão
      if (usuarioLogado?.role === "empresa" && !servicoEditando) {
        setFormData(prev => ({
          ...prev,
          empresa_id: usuarioLogado.usuario_id.toString()
        }));
      }
    }
  }, [showModal, usuarioLogado, servicoEditando]);

  const filteredServicos = servicos.filter(servico => {
    const matchesSearch = servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.empresa_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    
    const servicoDate = new Date(servico.data_cadastro);
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
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

  const abrirModalEditar = (servico) => {
    setServicoEditando(servico);
    setFormData({
      servico: servico.nome,
      valor: servico.valor.toString(),
      foto_principal: servico.foto_principal || "",
      empresa_id: servico.empresa_id.toString()
    });
    setShowModal(true);
  };

  const abrirModalDetalhes = (servico) => {
    setServicoEditando(servico);
    setShowDetailModal(true);
  };

  const abrirModalDeletar = (servico) => {
    setServicoParaDeletar(servico);
    setShowDeleteModal(true);
  };

  const fecharModais = () => {
    setShowModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setServicoEditando(null);
    setServicoParaDeletar(null);
    setFormData({
      servico: "",
      valor: "",
      foto_principal: "",
      empresa_id: usuarioLogado?.role === "empresa" ? usuarioLogado.usuario_id.toString() : ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.empresa_id) {
        toast.error("Por favor, selecione uma empresa responsável!");
        setLoading(false);
        return;
      }

      const payload = {
        nome: formData.servico,
        valor: parseFloat(formData.valor),
        foto_principal: formData.foto_principal || "",
        empresa_id: parseInt(formData.empresa_id)
      };

      if (servicoEditando) {
        // Editar serviço existente
        await axios.put(`${API_URL}/${servicoEditando.servico_id}`, payload, {
          headers: getAuthHeaders()
        });
        toast.success("Serviço atualizado com sucesso!");
      } else {
        // Criar novo serviço
        await axios.post(API_URL, payload, {
          headers: getAuthHeaders()
        });
        toast.success("Serviço cadastrado com sucesso!");
      }

      await carregarServicos();
      fecharModais();

    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      toast.error(`Erro ao ${servicoEditando ? 'atualizar' : 'cadastrar'} serviço. Tente novamente!`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!servicoParaDeletar) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${servicoParaDeletar.servico_id}`, {
        headers: getAuthHeaders()
      });
      
      toast.success("Serviço deletado com sucesso!");
      await carregarServicos();
      fecharModais();
    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
      toast.error("Erro ao deletar serviço. Tente novamente!");
    } finally {
      setLoading(false);
    }
  };

  const totalServicos = servicos.length;
  const totalFaturamento = servicos.reduce((sum, s) => sum + s.valor, 0);

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <div className="services-container">
          <ToastContainer />
          
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

          <div className="services-stats">
            <div className="stat-card total">
              <div className="stat-icon">
                <FaDollarSign />
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
                <span className="stat-label">Total em serviços prestados</span>
              </div>
            </div>
          </div>

          <div className="services-controls">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por serviço, responsável ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

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
                <div key={servico.servico_id} className="service-card">
                  <div className="service-card-content">
                    {servico.foto_principal && (
                      <div className="service-image">
                        <img 
                          src={servico.foto_principal} 
                          alt={servico.nome}
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
                          <span className="service-name">{servico.nome}</span>
                        </div>
                        <div className="service-badges">
                          <span className="value-badge">{formatCurrency(servico.valor)}</span>
                        </div>
                      </div>

                      <div className="service-details">
                        <div className="customer-info">
                          <h4><FaUser /> Responsável</h4>
                          <p><strong>{servico.empresa_nome}</strong></p>
                          <p>Tipo: {servico.empresa_role}</p>
                        </div>

                        <div className="service-date-info">
                          <h4><FaCalendar /> Datas</h4>
                          <div className="date-details">
                            <span className="date">Cadastro: {formatDateTime(servico.data_cadastro)}</span>
                            {servico.data_update && (
                              <span className="date">Atualização: {formatDateTime(servico.data_update)}</span>
                            )}
                          </div>
                        </div>

                        <div className="service-actions">
                          <button 
                            className="action-btn details-btn"
                            onClick={() => abrirModalDetalhes(servico)}
                          >
                            <FaEye /> Detalhes
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => abrirModalEditar(servico)}
                          >
                            <FaEdit /> Editar
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => abrirModalDeletar(servico)}
                          >
                            <FaTrash /> Excluir
                          </button>
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

      {/* Modal de Adicionar/Editar Serviço */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content service-modal">
            <div className="modal-header">
              <h2>{servicoEditando ? 'Editar Serviço' : 'Novo Serviço Prestado'}</h2>
              <button className="modal-close" onClick={fecharModais}>
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
                  <label htmlFor="empresa_id">Empresa Responsável *</label>
                  <select
                    id="empresa_id"
                    name="empresa_id"
                    value={formData.empresa_id}
                    onChange={handleInputChange}
                    required
                    disabled={loadingUsuarios || usuarioLogado?.role === "empresa"}
                  >
                    <option value="">Selecione a empresa responsável</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.usuario_id} value={usuario.usuario_id}>
                        {usuario.nome} - {usuario.email} ({usuario.role})
                      </option>
                    ))}
                  </select>
                  {loadingUsuarios && <p className="loading-text">Carregando empresas...</p>}
                  {usuarioLogado?.role === "empresa" && (
                    <p className="info-text">
                      Você está logado como empresa. O serviço será vinculado à sua empresa.
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="foto">Foto do Serviço (opcional)</label>
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
                      <img src={formData.foto_principal} alt="Preview do serviço" />
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
                  {loading ? "Salvando..." : (servicoEditando ? "Atualizar Serviço" : "Cadastrar Serviço")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetailModal && servicoEditando && (
        <div className="modal-overlay">
          <div className="modal-content service-modal">
            <div className="modal-header">
              <h2>Detalhes do Serviço</h2>
              <button className="modal-close" onClick={fecharModais}>
                <FaTimes />
              </button>
            </div>

            <div className="service-details-modal">
              {servicoEditando.foto_principal && (
                <div className="detail-image">
                  <img src={servicoEditando.foto_principal} alt={servicoEditando.nome} />
                </div>
              )}
              
              <div className="detail-info">
                <div className="detail-group">
                  <h3>Informações do Serviço</h3>
                  <p><strong>ID:</strong> {servicoEditando.id}</p>
                  <p><strong>Nome:</strong> {servicoEditando.nome}</p>
                  <p><strong>Valor:</strong> {formatCurrency(servicoEditando.valor)}</p>
                </div>

                <div className="detail-group">
                  <h3>Responsável</h3>
                  <p><strong>Nome:</strong> {servicoEditando.empresa_nome}</p>
                  <p><strong>Tipo:</strong> {servicoEditando.empresa_role}</p>
                </div>

                <div className="detail-group">
                  <h3>Datas</h3>
                  <p><strong>Cadastro:</strong> {formatDateTime(servicoEditando.data_cadastro)}</p>
                  {servicoEditando.data_update && (
                    <p><strong>Atualização:</strong> {formatDateTime(servicoEditando.data_update)}</p>
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
                    abrirModalEditar(servicoEditando);
                  }}
                >
                  <FaEdit /> Editar Serviço
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && servicoParaDeletar && (
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
              <h3>Tem certeza que deseja excluir este serviço?</h3>
              <p><strong>{servicoParaDeletar.nome}</strong> - {formatCurrency(servicoParaDeletar.valor)}</p>
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

export default ServicesProvidedPage;