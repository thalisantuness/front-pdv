import React, { useState, useEffect } from 'react';
import { FaComments, FaUser, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { usePlataforma } from '../../context/PlataformaContext';
import { API_ENDPOINTS } from '../../config/api';
import { toast } from 'react-toastify';
import './chat.css';

const ConversasList = ({ conversas, conversaAtual, onSelectConversa, loading, onCreateConversa }) => {
  const { usuario, getAuthHeaders } = usePlataforma();
  const [showModalUsuarios, setShowModalUsuarios] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isAdmin = usuario?.role === 'admin';
  // Carregar usuários quando modal abrir
  useEffect(() => {
    if (showModalUsuarios && isAdmin) {
      carregarUsuarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModalUsuarios, isAdmin]);

  // Filtrar usuários conforme busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setUsuariosFiltrados(usuarios);
    } else {
      const termo = searchTerm.toLowerCase();
      const filtrados = usuarios.filter(usuario => 
        usuario.nome?.toLowerCase().includes(termo) ||
        usuario.email?.toLowerCase().includes(termo) ||
        usuario.role?.toLowerCase().includes(termo)
      );
      setUsuariosFiltrados(filtrados);
    }
  }, [searchTerm, usuarios]);

  const carregarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await axios.get(API_ENDPOINTS.USUARIOS, {
        headers: getAuthHeaders()
      });

      // Filtrar apenas clientes e empresas (não incluir outros admins)
      const usuariosFiltrados = response.data.filter(u => 
        u.role === 'cliente' || u.role === 'empresa'
      );

      setUsuarios(usuariosFiltrados);
      setUsuariosFiltrados(usuariosFiltrados);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar lista de usuários');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleIniciarConversa = async (usuarioId) => {
    try {
      await onCreateConversa(usuarioId);
      setShowModalUsuarios(false);
      setSearchTerm('');
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const renderModalUsuarios = () => (
    <div className="modal-overlay" onClick={() => setShowModalUsuarios(false)}>
      <div className="modal-usuarios" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Iniciar Nova Conversa</h3>
          <button 
            className="btn-fechar-modal"
            onClick={() => setShowModalUsuarios(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="modal-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="modal-usuarios-list">
          {loadingUsuarios ? (
            <div className="loading-usuarios">
              <p>Carregando usuários...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="empty-usuarios">
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            usuariosFiltrados.map((usuario) => (
              <div
                key={usuario.usuario_id || usuario.id}
                className="usuario-item"
                onClick={() => handleIniciarConversa(usuario.usuario_id || usuario.id)}
              >
                <div className="usuario-avatar">
                  {usuario.foto_perfil ? (
                    <img 
                      src={usuario.foto_perfil} 
                      alt={usuario.nome}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/50';
                      }}
                    />
                  ) : (
                    <FaUser className="avatar-placeholder" />
                  )}
                </div>
                <div className="usuario-info">
                  <div className="usuario-nome">{usuario.nome || 'Sem nome'}</div>
                  <div className="usuario-email">{usuario.email || '-'}</div>
                  <div className="usuario-role">
                    {usuario.role === 'cliente' ? 'Cliente' : 
                     usuario.role === 'empresa' ? 'Empresa' : usuario.role}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const formatarUltimaMensagem = (dataString) => {
    if (!dataString) return 'Sem mensagens';
    
    const data = new Date(dataString);
    const agora = new Date();
    const diffMs = agora - data;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <div className="conversas-list">
          <div className="conversas-header">
            <FaComments className="header-icon" style={{ color: '#000' }} />
            <h2>Conversas</h2>
            {isAdmin && (
              <button 
                className="btn-nova-conversa"
                onClick={() => setShowModalUsuarios(true)}
                title="Iniciar nova conversa"
              >
                <FaPlus />
              </button>
            )}
          </div>
          <div className="conversas-loading">
            <p>Carregando conversas...</p>
          </div>
        </div>
        {showModalUsuarios && isAdmin && renderModalUsuarios()}
      </>
    );
  }

  if (conversas.length === 0) {
    return (
      <>
        <div className="conversas-list">
          <div className="conversas-header">
            <FaComments className="header-icon" />
            <h2>Conversas</h2>
            {isAdmin && (
              <button 
                className="btn-nova-conversa"
                onClick={() => setShowModalUsuarios(true)}
                title="Iniciar nova conversa"
              >
                <FaPlus />
              </button>
            )}
          </div>
          <div className="conversas-empty">
            <FaComments className="empty-icon" />
            <p>Nenhuma conversa encontrada</p>
            <span>Inicie uma conversa com um cliente</span>
          </div>
        </div>
        {showModalUsuarios && isAdmin && renderModalUsuarios()}
      </>
    );
  }

  return (
    <>
      <div className="conversas-list">
        <div className="conversas-header">
          <FaComments className="header-icon" />
          <h2>Conversas com Clientes</h2>
          {isAdmin && (
            <button 
              className="btn-nova-conversa"
              onClick={() => setShowModalUsuarios(true)}
              title="Iniciar nova conversa"
            >
              <FaPlus />
            </button>
          )}
        </div>
      
      <div className="conversas-items">
        {conversas.map((conversa) => {
          const isActive = conversaAtual?.conversa_id === conversa.conversa_id;
          const cliente = conversa.Usuario1;
          
          return (
            <div
              key={conversa.conversa_id}
              className={`conversa-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectConversa(conversa)}
            >
              <div className="conversa-avatar">
                {cliente?.foto_perfil ? (
                  <img 
                    src={cliente.foto_perfil} 
                    alt={cliente.nome}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/50';
                    }}
                  />
                ) : (
                  <FaUser className="avatar-placeholder" />
                )}
              </div>
              
              <div className="conversa-info">
                <div className="conversa-nome">
                  {cliente?.nome || 'Cliente'}
                </div>
                <div className="conversa-preview">
                  {conversa.ultima_mensagem_texto || 'Sem mensagens'}
                </div>
                <div className="conversa-meta">
                  <span className="conversa-time">
                    {formatarUltimaMensagem(conversa.ultima_mensagem)}
                  </span>
                  {conversa.nao_lidas > 0 && (
                    <span className="conversa-badge">
                      {conversa.nao_lidas}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Modal de Seleção de Usuários (apenas para admin) */}
      {showModalUsuarios && isAdmin && renderModalUsuarios()}
    </>
  );
};

export default ConversasList;

