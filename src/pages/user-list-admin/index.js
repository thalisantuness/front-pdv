import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPlus, FaUser, FaUserTie, FaUserShield, FaEnvelope, FaPhone, FaCalendar, FaSync, FaUserTag, FaBuilding, FaTimes, FaSave, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";
import "./styles.css";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/SideBar/index";
import { useImovel } from "../../context/ImovelContext";

function UserListAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    nome: "",
    telefone: "",
    role: "cliente",
    foto_perfil: null
  });
  const [formLoading, setFormLoading] = useState(false);
  
  const { getAuthHeaders, isAuthenticated, loading: contextLoading, usuario: usuarioLogado } = useImovel();
  const navigate = useNavigate();

  // URL da API
  const API_URL = "https://back-pdv-production.up.railway.app/usuarios";
  const CADASTRO_URL = "https://back-pdv-production.up.railway.app/cadastrar";

  useEffect(() => {
    if (!contextLoading) {
      fetchUsers();
    }
  }, [contextLoading]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated()) {
        toast.error("Usuário não autenticado! Redirecionando para login...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
        setLoading(false);
        return;
      }

      const response = await axios.get(API_URL, {
        headers: getAuthHeaders()
      });

      if (response.data && response.data.usuarios && Array.isArray(response.data.usuarios)) {
        const usersData = response.data.usuarios.map(user => ({
          id: user.usuario_id,
          nome: user.nome || user.email,
          email: user.email,
          telefone: user.telefone || "Não informado",
          tipo: mapUserRole(user.role),
          role: user.role,
          data_cadastro: user.data_cadastro || new Date().toISOString(),
          ultimo_acesso: user.data_update || user.data_cadastro || new Date().toISOString()
        }));

        setUsuarios(usersData);
        
        if (response.data.message && response.data.usuarios.length === 0) {
          toast.info(response.data.message, {
            position: "top-right",
            autoClose: 4000,
          });
        }
        
      } else if (Array.isArray(response.data)) {
        const usersData = response.data.map(user => ({
          id: user.usuario_id,
          nome: user.nome || user.email,
          email: user.email,
          telefone: user.telefone || "Não informado",
          tipo: mapUserRole(user.role),
          role: user.role,
          data_cadastro: user.data_cadastro || new Date().toISOString(),
          ultimo_acesso: user.data_update || user.data_cadastro || new Date().toISOString()
        }));

        setUsuarios(usersData);
      } else {
        console.warn("Estrutura de resposta inesperada:", response.data);
        
        if (response.data.message) {
          toast.info(response.data.message, {
            position: "top-right",
            autoClose: 4000,
          });
        }
        
        setUsuarios([]);
      }

      setLoading(false);
      
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      
      const errorMessage = error.response?.data?.message || "Erro ao carregar usuários";
      
      if (error.response?.status === 401) {
        toast.error("Sessão expirada! Faça login novamente.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else if (error.response?.status === 403) {
        toast.error("Acesso negado! Você não tem permissão para ver usuários.");
      } else if (error.response?.status === 404) {
        toast.info(errorMessage, {
          position: "top-right",
          autoClose: 4000,
        });
        setUsuarios([]);
      } else {
        toast.error(errorMessage);
      }
      
      setLoading(false);
    }
  };

  // Mapear roles da API para os tipos do componente
  const mapUserRole = (role) => {
    const roleMap = {
      'admin': 'admin',
      'empresa': 'empresa',
      'vendedor': 'vendedor',
      'caixa': 'caixa',
      'user': 'user',
      'cliente': 'cliente'
    };
    return roleMap[role] || 'user';
  };

  const handleDeleteClick = (usuario) => {
    setUsuarioToDelete(usuario);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!usuarioToDelete) return;

    try {
      await axios.delete(`${API_URL}/${usuarioToDelete.id}`, {
        headers: getAuthHeaders()
      });
      
      setUsuarios(usuarios.filter(usuario => usuario.id !== usuarioToDelete.id));
      toast.success("Usuário excluído com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      
      const errorMessage = error.response?.data?.message || "Erro ao excluir usuário. Tente novamente!";
      
      if (error.response?.status === 401) {
        toast.error("Sessão expirada! Faça login novamente.");
        navigate("/");
      } else {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setShowDeleteModal(false);
      setUsuarioToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUsuarioToDelete(null);
  };

  const handleEdit = async (id) => {
    try {
      setFormLoading(true);
      
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
      });

      const userData = response.data;
      
      setFormData({
        email: userData.email || "",
        senha: "", // Senha em branco para edição
        nome: userData.nome || "",
        telefone: userData.telefone || "",
        role: userData.role || "cliente",
        foto_perfil: userData.foto_perfil || ""
      });
      
      setEditingUser(id);
      setShowModal(true);
      
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      toast.error("Erro ao carregar dados do usuário para edição");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  // Modal functions
  const openModal = () => {
    // Se o usuário logado for empresa, define role como empresa por padrão
    const defaultRole = usuarioLogado?.role === 'empresa' ? 'empresa' : 'cliente';
    
    setFormData({
      email: "",
      senha: "",
      nome: "",
      telefone: "",
      role: defaultRole,
      foto_perfil: ""
    });
    setEditingUser(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      email: "",
      senha: "",
      nome: "",
      telefone: "",
      role: "cliente",
      foto_perfil: ""
    });
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
    setFormLoading(true);

    try {
      if (editingUser) {
        // Edição de usuário existente
        const payload = {
          email: formData.email,
          nome: formData.nome,
          telefone: formData.telefone,
          role: formData.role,
          foto_perfil: formData.foto_perfil || ""
        };

        // Só inclui a senha se foi alterada
        if (formData.senha) {
          payload.senha = formData.senha;
        }

        await axios.put(`${API_URL}/${editingUser}`, payload, {
          headers: getAuthHeaders()
        });

        toast.success("Usuário atualizado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // Cadastro de novo usuário
        const payload = {
          email: formData.email,
          senha: formData.senha,
          nome: formData.nome,
          telefone: formData.telefone,
          role: formData.role,
          foto_perfil: formData.foto_perfil || ""
        };

        await axios.post(CADASTRO_URL, payload, {
          headers: getAuthHeaders()
        });

        toast.success("Usuário cadastrado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      closeModal();
      fetchUsers(); // Atualiza a lista de usuários

    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      
      const errorMessage = error.response?.data?.message || 
        (editingUser ? "Erro ao atualizar usuário. Tente novamente!" : "Erro ao cadastrar usuário. Tente novamente!");
      
      if (error.response?.status === 401) {
        toast.error("Sessão expirada! Faça login novamente.");
        navigate("/");
      } else {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'admin': return <FaUserShield className="tipo-icon admin" />;
      case 'empresa': return <FaBuilding className="tipo-icon empresa" />;
      case 'vendedor': return <FaUserTie className="tipo-icon vendedor" />;
      case 'caixa': return <FaUser className="tipo-icon caixa" />;
      case 'cliente': return <FaUserTag className="tipo-icon cliente" />;
      case 'user': return <FaUser className="tipo-icon user" />;
      default: return <FaUser className="tipo-icon" />;
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'admin': return 'Administrador';
      case 'empresa': return 'Empresa';
      case 'vendedor': return 'Vendedor';
      case 'caixa': return 'Caixa';
      case 'cliente': return 'Cliente';
      case 'user': return 'Usuário';
      default: return 'Usuário';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Não informada";
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return "Data inválida";
    }
  };

  // Verificar se usuário logado é admin
  const isAdmin = usuarioLogado?.role === 'admin';

  // Loading do contexto
  if (contextLoading) {
    return (
      <div className="container">
        <SideBar />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Verificação de autenticação
  if (!isAuthenticated()) {
    return (
      <div className="container">
        <SideBar />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Redirecionando para login...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <SideBar />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <div className="user-admin-container">
          <ToastContainer />
          
          {/* Header */}
          <div className="user-admin-header">
            <div className="header-title">
              <FaUserTie className="header-icon" />
              <h1>Gerenciar Usuários</h1>
            </div>
            <div className="header-actions">
              <button 
                onClick={handleRefresh}
                className="refresh-btn"
              >
                <FaSync /> Atualizar
              </button>
              <button 
                onClick={openModal}
                className="add-user-btn"
              >
                <FaPlus /> Adicionar Usuário
              </button>
            </div>
          </div>

          {/* Estatística - Só mostra se tiver usuários */}
          {usuarios.length > 0 && (
            <div className="users-controls">
              <div className="users-stats">
                <div className="stat-card">
                  <span className="stat-number">{usuarios.length}</span>
                  <span className="stat-label">Total</span>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Usuários */}
          <div className="users-list-container">
            {usuarios.length === 0 ? (
              <div className="not-found-message">
                <FaUser className="not-found-icon" />
                <h3>Nenhum usuário encontrado</h3>
                <p>Clique em "Adicionar Usuário" para cadastrar o primeiro usuário</p>
              </div>
            ) : (
              <div className="users-table">
                <div className="table-header">
                  <div className="table-col user">Usuário</div>
                  <div className="table-col contact">Contato</div>
                  <div className="table-col type">Tipo</div>
                  <div className="table-col dates">Datas</div>
                  <div className="table-col actions">Ações</div>
                </div>

                <div className="table-body">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="table-row">
                      <div className="table-col user">
                        <div className="user-avatar">
                          {getTipoIcon(usuario.tipo)}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{usuario.nome}</div>
                          <div className="user-email">{usuario.email}</div>
                        </div>
                      </div>
                      
                      <div className="table-col contact">
                        <div className="contact-info">
                          <div className="contact-item">
                            <FaEnvelope className="contact-icon" />
                            {usuario.email}
                          </div>
                          <div className="contact-item">
                            <FaPhone className="contact-icon" />
                            {usuario.telefone}
                          </div>
                        </div>
                      </div>
                      
                      <div className="table-col type">
                        <span className={`type-badge ${usuario.tipo}`}>
                          {getTipoLabel(usuario.tipo)}
                        </span>
                      </div>
                      
                      <div className="table-col dates">
                        <div className="date-info">
                          <div className="date-item">
                            <FaCalendar className="date-icon" />
                            <span>Cadastro: {formatDate(usuario.data_cadastro)}</span>
                          </div>
                          <div className="date-item">
                            <FaCalendar className="date-icon" />
                            <span>Último acesso: {formatDate(usuario.ultimo_acesso)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="table-col actions">
                        <button 
                          className="action-btn edit-btn"
                          title="Editar usuário"
                          onClick={() => handleEdit(usuario.id)}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(usuario)}
                          className="action-btn delete-btn"
                          title="Excluir usuário"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cadastro/Edição de Usuário */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="exemplo@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="senha">
                  Senha {editingUser ? '(deixe em branco para manter atual)' : '*'}
                </label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  placeholder={editingUser ? "Digite nova senha (opcional)" : "Digite uma senha"}
                  minLength={editingUser ? "0" : "6"}
                  required={!editingUser}
                />
              </div>

              <div className="form-group">
                <label htmlFor="nome">Nome Completo *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefone">Telefone *</label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  required
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Tipo de Usuário *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  disabled={!isAdmin} // Desabilita se não for admin
                >
                  {isAdmin ? (
                    <>
                      <option value="admin">Administrador</option>
                      <option value="empresa">Empresa</option>
                      <option value="cliente">Cliente</option>
                    </>
                  ) : (
                    <option value="empresa">Empresa</option>
                  )}
                </select>
                {!isAdmin && (
                  <small className="form-help">
                    Empresas só podem cadastrar outras empresas
                  </small>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    "Salvando..."
                  ) : (
                    <>
                      {editingUser ? <FaSave /> : <FaPlus />}
                      {editingUser ? ' Atualizar Usuário' : ' Cadastrar Usuário'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && usuarioToDelete && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirmation-modal">
            <div className="modal-header">
              <h2>Confirmar Exclusão</h2>
              <button className="modal-close" onClick={handleDeleteCancel}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="delete-warning">
                <FaExclamationTriangle className="warning-icon" />
                <h3>Tem certeza que deseja excluir este usuário?</h3>
              </div>
              
              <div className="user-to-delete">
                <div className="user-avatar">
                  {getTipoIcon(usuarioToDelete.tipo)}
                </div>
                <div className="user-details">
                  <div className="user-name">{usuarioToDelete.nome}</div>
                  <div className="user-email">{usuarioToDelete.email}</div>
                  <div className="user-type">{getTipoLabel(usuarioToDelete.tipo)}</div>
                </div>
              </div>
              
              <div className="delete-warning-text">
                <p>Esta ação não pode ser desfeita. O usuário será permanentemente removido do sistema.</p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleDeleteCancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={handleDeleteConfirm}
              >
                <FaTrash />
                Excluir Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserListAdmin;