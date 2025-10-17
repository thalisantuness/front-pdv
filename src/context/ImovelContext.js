import { createContext, useContext, useState, useEffect } from "react";

const ImovelContext = createContext();

export const ImovelProvider = ({ children }) => {
  const [filtros, setFiltros] = useState({});
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se usuário está logado ao carregar a aplicação
  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");
    
    if (tokenSalvo) {
      setToken(tokenSalvo);
      if (usuarioSalvo) {
        try {
          setUsuario(JSON.parse(usuarioSalvo));
        } catch (error) {
          console.error("Erro ao parsear usuário:", error);
          localStorage.removeItem("usuario");
        }
      }
    }
    setLoading(false);
  }, []);

  // Função de login
  const login = (usuarioData, tokenData) => {
    setUsuario(usuarioData);
    setToken(tokenData);
    localStorage.setItem("token", tokenData);
    localStorage.setItem("usuario", JSON.stringify(usuarioData));
  };

  // Função de logout
  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  };

  // Verificar se está autenticado - CORREÇÃO AQUI
  const isAuthenticated = () => {
    return !!token; // Apenas verifica se tem token
  };

  // Obter headers para requisições autenticadas
  const getAuthHeaders = () => {
    if (!token) {
      console.warn("Token não disponível para headers");
      return {
        "Content-Type": "application/json"
      };
    }
    
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  return (
    <ImovelContext.Provider value={{ 
      filtros, 
      setFiltros,
      usuario,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
      getAuthHeaders
    }}>
      {children}
    </ImovelContext.Provider>
  );
};

export const useImovel = () => {
  const context = useContext(ImovelContext);
  if (!context) {
    throw new Error("useImovel deve ser usado dentro de um ImovelProvider");
  }
  return context;
};