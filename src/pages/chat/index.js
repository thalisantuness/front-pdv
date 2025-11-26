import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../components/SideBar';
import ConversasList from '../../components/chat/ConversasList';
import ChatWindow from '../../components/chat/ChatWindow';
import { useChat } from '../../hooks/useChat';
import { usePlataforma } from '../../context/PlataformaContext';
import { ToastContainer, toast } from 'react-toastify';
import './styles.css';

function ChatPage() {
  const navigate = useNavigate();
  const { usuario, isAuthenticated } = usePlataforma();
  const {
    conversas,
    conversaAtual,
    mensagens,
    loading,
    enviando,
    carregarConversas,
    selecionarConversa,
    enviarMensagem,
    isMinhaMensagem,
    isMensagemFuncionario
  } = useChat();

  const [showConversas, setShowConversas] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

    // Verificar se é empresa ou funcionário
    const role = usuario?.role;
    if (role !== 'empresa' && role !== 'empresa-funcionario') {
      toast.error('Acesso restrito a empresas e funcionários');
      navigate('/home');
      return;
    }

    // Carregar conversas ao montar
    carregarConversas();
  }, [isAuthenticated, usuario, navigate, carregarConversas]);

  const handleSelectConversa = (conversa) => {
    selecionarConversa(conversa);
    setShowConversas(false);
  };

  const handleBack = () => {
    setShowConversas(true);
  };

  const handleSendMessage = async (conteudo, destinatarioId) => {
    await enviarMensagem(conteudo, destinatarioId);
  };

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <div className="chat-page-container">
          <ToastContainer />
          
          <div className="chat-container">
            {(showConversas || window.innerWidth > 768) && (
              <ConversasList
                conversas={conversas}
                conversaAtual={conversaAtual}
                onSelectConversa={handleSelectConversa}
                loading={loading}
              />
            )}
            
            {(!showConversas || window.innerWidth > 768) && (
              <ChatWindow
                conversa={conversaAtual}
                mensagens={mensagens}
                onSendMessage={handleSendMessage}
                onBack={handleBack}
                enviando={enviando}
                isMinhaMensagem={isMinhaMensagem}
                isMensagemFuncionario={isMensagemFuncionario}
                usuarioLogado={usuario}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;

