import React from 'react';
import { FaComments, FaUser } from 'react-icons/fa';
import './chat.css';

const ConversasList = ({ conversas, conversaAtual, onSelectConversa, loading }) => {
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
      <div className="conversas-list">
        <div className="conversas-header">
          <FaComments className="header-icon" />
          <h2>Conversas</h2>
        </div>
        <div className="conversas-loading">
          <p>Carregando conversas...</p>
        </div>
      </div>
    );
  }

  if (conversas.length === 0) {
    return (
      <div className="conversas-list">
        <div className="conversas-header">
          <FaComments className="header-icon" />
          <h2>Conversas</h2>
        </div>
        <div className="conversas-empty">
          <FaComments className="empty-icon" />
          <p>Nenhuma conversa encontrada</p>
          <span>Inicie uma conversa com um cliente</span>
        </div>
      </div>
    );
  }

  return (
    <div className="conversas-list">
      <div className="conversas-header">
        <FaComments className="header-icon" />
        <h2>Conversas com Clientes</h2>
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
  );
};

export default ConversasList;

