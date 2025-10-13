import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPlus, FaUser, FaUserTie, FaUserShield, FaEnvelope, FaPhone, FaCalendar } from "react-icons/fa";
import axios from "axios";
import "./styles.css";
import { ToastContainer, toast } from 'react-toastify';
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar/index"; // Ajuste o caminho conforme sua estrutura

function UserListAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, inactive

  // Dados mockados - substitua pela sua API real
  const mockUsers = [
    {
      id: 1,
      nome: "João Silva",
      email: "joao.silva@email.com",
      telefone: "(11) 99999-9999",
      tipo: "admin",
      status: "active",
      data_cadastro: "2024-01-15",
      ultimo_acesso: "2024-03-20"
    },
    {
      id: 2,
      nome: "Maria Santos",
      email: "maria.santos@email.com",
      telefone: "(11) 98888-8888",
      tipo: "vendedor",
      status: "active",
      data_cadastro: "2024-02-10",
      ultimo_acesso: "2024-03-19"
    },
    {
      id: 3,
      nome: "Pedro Oliveira",
      email: "pedro.oliveira@email.com",
      telefone: "(11) 97777-7777",
      tipo: "caixa",
      status: "active",
      data_cadastro: "2024-01-20",
      ultimo_acesso: "2024-03-18"
    },
    {
      id: 4,
      nome: "Ana Costa",
      email: "ana.costa@email.com",
      telefone: "(11) 96666-6666",
      tipo: "vendedor",
      status: "inactive",
      data_cadastro: "2024-01-05",
      ultimo_acesso: "2024-02-28"
    },
    {
      id: 5,
      nome: "Carlos Lima",
      email: "carlos.lima@email.com",
      telefone: "(11) 95555-5555",
      tipo: "caixa",
      status: "active",
      data_cadastro: "2024-03-01",
      ultimo_acesso: "2024-03-20"
    }
  ];

  useEffect(() => {
    // Simulando chamada API
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Substitua pela sua API real:
        // const response = await axios.get("https://sua-api.com/usuarios");
        // setUsuarios(response.data);
        
        // Usando dados mockados por enquanto:
        setTimeout(() => {
          setUsuarios(mockUsers);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        toast.error("Erro ao carregar usuários!");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        // Substitua pela sua API real:
        // await axios.delete(`https://sua-api.com/usuarios/${id}`);
        
        setUsuarios(usuarios.filter(usuario => usuario.id !== id));
        toast.success("Usuário excluído com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        toast.error("Erro ao excluir usuário. Tente novamente!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      // Substitua pela sua API real:
      // await axios.patch(`https://sua-api.com/usuarios/${id}`, { 
      //   status: usuarios.find(u => u.id === id).status === 'active' ? 'inactive' : 'active' 
      // });
      
      setUsuarios(usuarios.map(usuario =>
        usuario.id === id
          ? { ...usuario, status: usuario.status === 'active' ? 'inactive' : 'active' }
          : usuario
      ));
      
      toast.success("Status do usuário atualizado!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status!");
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'admin': return <FaUserShield className="tipo-icon admin" />;
      case 'vendedor': return <FaUserTie className="tipo-icon vendedor" />;
      case 'caixa': return <FaUser className="tipo-icon caixa" />;
      default: return <FaUser className="tipo-icon" />;
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'admin': return 'Administrador';
      case 'vendedor': return 'Vendedor';
      case 'caixa': return 'Caixa';
      default: return 'Usuário';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredUsers = usuarios.filter(usuario => {
    if (filter === "all") return true;
    return usuario.status === filter;
  });

  if (loading) {
    return (
      <div className="container">
        <NavBar />
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
      <NavBar />
      <div className="main-content">
        <div className="user-admin-container">
          <ToastContainer />
          
          {/* Header */}
          <div className="user-admin-header">
            <div className="header-title">
              <FaUserTie className="header-icon" />
              <h1>Gerenciar Usuários</h1>
            </div>
            <Link to="/cadastro-usuario" className="add-user-btn">
              <FaPlus /> Adicionar Usuário
            </Link>
          </div>

          {/* Filtros e Estatísticas */}
          <div className="users-controls">
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Todos
              </button>
              <button 
                className={`filter-btn ${filter === "active" ? "active" : ""}`}
                onClick={() => setFilter("active")}
              >
                Ativos
              </button>
              <button 
                className={`filter-btn ${filter === "inactive" ? "active" : ""}`}
                onClick={() => setFilter("inactive")}
              >
                Inativos
              </button>
            </div>

            <div className="users-stats">
              <div className="stat-card">
                <span className="stat-number">{usuarios.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {usuarios.filter(u => u.status === 'active').length}
                </span>
                <span className="stat-label">Ativos</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {usuarios.filter(u => u.tipo === 'admin').length}
                </span>
                <span className="stat-label">Administradores</span>
              </div>
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="users-list-container">
            {filteredUsers.length === 0 ? (
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
                  <div className="table-col status">Status</div>
                  <div className="table-col actions">Ações</div>
                </div>

                <div className="table-body">
                  {filteredUsers.map((usuario) => (
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
                      
                      <div className="table-col status">
                        <button 
                          onClick={() => handleStatusToggle(usuario.id)}
                          className={`status-toggle ${usuario.status}`}
                        >
                          {usuario.status === 'active' ? 'Ativo' : 'Inativo'}
                        </button>
                      </div>
                      
                      <div className="table-col actions">
                        <Link 
                          to={`/editar-usuario/${usuario.id}`}
                          className="action-btn edit-btn"
                          title="Editar usuário"
                        >
                          <FaEdit />
                        </Link>
                        <button 
                          onClick={() => handleDelete(usuario.id)}
                          className="action-btn delete-btn"
                          title="Excluir usuário"
                        >
                          <FaTrash />
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
    </div>
  );
}

export default UserListAdmin;