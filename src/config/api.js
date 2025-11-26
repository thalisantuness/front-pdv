// Configuração da API
// Para usar API local, defina USE_LOCAL_API = true
// Para usar API de produção, defina USE_LOCAL_API = false

const USE_LOCAL_API = false; // Mude para true quando for usar API local

// URLs
const LOCAL_API_URL = 'http://192.168.128.1:4000';
const PRODUCTION_API_URL = 'https://back-pdv-production.up.railway.app';

// URL base da API
export const API_BASE_URL = USE_LOCAL_API ? LOCAL_API_URL : PRODUCTION_API_URL;

// URL do Socket.IO (mesma da API)
export const SOCKET_URL = USE_LOCAL_API ? LOCAL_API_URL : PRODUCTION_API_URL;

// Endpoints específicos
export const API_ENDPOINTS = {
  // Autenticação
  LOGIN: `${API_BASE_URL}/login`,
  CADASTRO: `${API_BASE_URL}/cadastrar`,
  
  // Usuários
  USUARIOS: `${API_BASE_URL}/usuarios`,
  
  // Produtos
  PRODUTOS: `${API_BASE_URL}/produtos`,
  
  // Pedidos
  PEDIDOS: `${API_BASE_URL}/pedidos`,
  
  // Chat
  CONVERSAS: `${API_BASE_URL}/conversas`,
  MENSAGENS: (conversaId) => `${API_BASE_URL}/conversas/${conversaId}/mensagens`,
  MARCAR_LIDA: (mensagemId) => `${API_BASE_URL}/mensagens/${mensagemId}/lida`,
};

// Log para debug
if (USE_LOCAL_API) {
  console.log('🔧 Usando API LOCAL:', API_BASE_URL);
} else {
  console.log('🌐 Usando API PRODUÇÃO:', API_BASE_URL);
}

