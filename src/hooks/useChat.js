import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { usePlataforma } from '../context/PlataformaContext';
import { toast } from 'react-toastify';
import { SOCKET_URL, API_ENDPOINTS } from '../config/api';

export const useChat = () => {
  const { usuario, token, getAuthHeaders } = usePlataforma();
  const [conversas, setConversas] = useState([]);
  const [conversaAtual, setConversaAtual] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const socketRef = useRef(null);

  // Conectar Socket.IO
  useEffect(() => {
    if (!token || !usuario) return;

    // Conectar socket com autenticação
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Eventos do socket
    socket.on('connect', () => {
      console.log('✅ Conectado ao Socket.IO');
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado do Socket.IO');
    });

    const handleReceivedMessage = (mensagemData) => {
      console.log('📨 Nova mensagem recebida:', mensagemData);
      
      // Adicionar mensagem ao estado
      setMensagens(prev => {
        // Evitar duplicatas
        const existe = prev.find(m => m.mensagem_id === mensagemData.mensagem_id);
        if (existe) return prev;
        return [...prev, mensagemData];
      });

      // Se a conversa não estiver aberta, atualizar badge
      if (mensagemData.conversa_id !== conversaAtual?.conversa_id) {
        setConversas(prev => prev.map(conv => {
          if (conv.conversa_id === mensagemData.conversa_id) {
            return { ...conv, nao_lidas: (conv.nao_lidas || 0) + 1 };
          }
          return conv;
        }));
      }

      // Notificação se não for você quem enviou
      if (mensagemData.remetente_id !== usuario.usuario_id) {
        toast.info(`Nova mensagem de ${mensagemData.Remetente?.nome || 'Cliente'}`, {
          position: 'top-right',
          autoClose: 3000
        });
      }
    };

    socket.on('receivedMessage', handleReceivedMessage);

    socket.on('error', (error) => {
      console.error('❌ Erro no Socket.IO:', error);
      toast.error(error.message || 'Erro na conexão do chat');
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.off('receivedMessage', handleReceivedMessage);
        socket.disconnect();
      }
    };
  }, [token, usuario, conversaAtual]);

  // Carregar conversas
  const carregarConversas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.CONVERSAS, {
        headers: getAuthHeaders()
      });

      // Ordenar por última mensagem (mais recente primeiro)
      const conversasOrdenadas = response.data.sort((a, b) => {
        const dataA = new Date(a.ultima_mensagem || 0);
        const dataB = new Date(b.ultima_mensagem || 0);
        return dataB - dataA;
      });

      setConversas(conversasOrdenadas);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Carregar mensagens de uma conversa
  const carregarMensagens = useCallback(async (conversaId) => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.MENSAGENS(conversaId), {
        headers: getAuthHeaders()
      });

      // Ordenar por data de envio (mais antiga primeiro)
      const mensagensOrdenadas = response.data.sort((a, b) => {
        const dataA = new Date(a.data_envio || 0);
        const dataB = new Date(b.data_envio || 0);
        return dataA - dataB;
      });

      setMensagens(mensagensOrdenadas);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Criar nova conversa
  const criarConversa = useCallback(async (destinatarioId) => {
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.CONVERSAS, {
        destinatario_id: destinatarioId
      }, {
        headers: getAuthHeaders()
      });

      toast.success('Conversa criada com sucesso');
      
      // Recarregar conversas
      await carregarConversas();
      
      // Abrir a nova conversa
      if (response.data.conversa) {
        setConversaAtual(response.data.conversa);
        await carregarMensagens(response.data.conversa.conversa_id);
      }

      return response.data.conversa;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar conversa';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, carregarConversas, carregarMensagens]);

  // Enviar mensagem
  const enviarMensagem = useCallback(async (conteudo, destinatarioId) => {
    if (!conteudo.trim() || !socketRef.current) return;

    try {
      setEnviando(true);
      
      // Enviar via Socket.IO
      socketRef.current.emit('sendMessage', {
        destinatario_id: destinatarioId,
        conteudo: conteudo.trim()
      });

      // A mensagem será adicionada ao estado quando o servidor confirmar via 'receivedMessage'
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setEnviando(false);
    }
  }, []);

  // Marcar mensagem como lida
  const marcarComoLida = useCallback(async (mensagemId) => {
    try {
      await axios.put(API_ENDPOINTS.MARCAR_LIDA(mensagemId), {}, {
        headers: getAuthHeaders()
      });
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  }, [getAuthHeaders]);


  // Selecionar conversa
  const selecionarConversa = useCallback(async (conversa) => {
    setConversaAtual(conversa);
    await carregarMensagens(conversa.conversa_id);
    
    // Marcar mensagens não lidas como lidas
    const mensagensNaoLidas = mensagens.filter(m => 
      !m.lida && m.remetente_id !== usuario?.usuario_id
    );
    
    for (const msg of mensagensNaoLidas) {
      await marcarComoLida(msg.mensagem_id);
    }

    // Atualizar conversa para remover badge
    setConversas(prev => prev.map(conv => {
      if (conv.conversa_id === conversa.conversa_id) {
        return { ...conv, nao_lidas: 0 };
      }
      return conv;
    }));
  }, [carregarMensagens, mensagens, usuario, marcarComoLida]);

  // Verificar se mensagem foi enviada por você
  const isMinhaMensagem = useCallback((mensagem) => {
    return mensagem.remetente_id === usuario?.usuario_id;
  }, [usuario]);

  // Verificar se mensagem foi enviada por outro funcionário
  const isMensagemFuncionario = useCallback((mensagem) => {
    if (!usuario) return false;
    // Se não é você e não é o cliente (usuario1_id), é outro funcionário
    const clienteId = conversaAtual?.usuario1_id;
    return mensagem.remetente_id !== usuario.usuario_id && 
           mensagem.remetente_id !== clienteId;
  }, [usuario, conversaAtual]);

  return {
    conversas,
    conversaAtual,
    mensagens,
    loading,
    enviando,
    carregarConversas,
    carregarMensagens,
    criarConversa,
    enviarMensagem,
    marcarComoLida,
    selecionarConversa,
    isMinhaMensagem,
    isMensagemFuncionario
  };
};

