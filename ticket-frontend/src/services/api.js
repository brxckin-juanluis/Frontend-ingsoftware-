const BASE_URL = /*import.meta.env.VITE_API_URL ||*/ 'http://localhost:3000/api';

/**
 * Utilidad base para peticiones HTTP
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token && token !== 'null' && token !== 'undefined') {
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    defaultHeaders['Authorization'] = bearerToken;
    // Log para depuración (solo en desarrollo)
    console.log(`[API Request] ${options.method || 'GET'} ${endpoint} - Token: ${token.substring(0, 15)}...`);
  } else {
    console.warn(`[API Request] ${options.method || 'GET'} ${endpoint} - SIN TOKEN`);
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Si la respuesta no es OK, intentamos obtener el cuerpo del error
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Si no es JSON, capturamos el texto
        const textError = await response.text();
        errorData = { message: textError || response.statusText };
      }

      console.error(`[API Error] ${response.status} ${endpoint}:`, errorData);

      if (response.status === 401) {
        if (!endpoint.includes('/auth/login')) {
          // No removemos el token inmediatamente para permitir reintento o inspección
          // Pero lanzamos el error que el Contexto capturará
          throw new Error(errorData.message || 'Sesión expirada');
        } else {
          throw new Error(errorData.message || 'Usuario o contraseña incorrectos');
        }
      }
      
      throw new Error(errorData.message || 'Error en la petición');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message !== 'Sesión expirada' && !error.message.includes('401')) {
      console.error(`[API Fetch Failure] ${endpoint}:`, error.message);
    }
    throw error;
  }
};

/**
 * Servicios específicos por módulo
 */
export const authService = {
  login: (credentials) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData) => apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  getProfile: () => apiFetch('/auth/user'),
};

export const ticketService = {
  getAll: () => apiFetch('/retrieve/tickets'),
  getById: (id) => apiFetch(`/tickets/${id}`),
  create: (data) => apiFetch('/create/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (data) => apiFetch('/update/ticket', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getToday: () => apiFetch('/retrieve/tickets',{
    method:'GET'
  })
};

export const paymentService = {
  getAll: () => apiFetch('/retrieve/payments',{
    method:'GET'
  })
};

export const spaceService = {
  getAvailables: (idParqueo) => apiFetch(`/retrieve/spaces?idParqueo=${idParqueo}`)
};

export const brandService = {
  getAll: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/retrieve/catalog?${queryString}`,{
      method:'GET'
    });
  }, // Usualmente los catalogos traen marcas/modelos
  create: (data) => apiFetch('/create/brands', {
    method: 'POST',
    body: JSON.stringify(data),
  })
};

export const typeService = {
  getAll: (params) => {
    const queryString = new URLSearchParams(params).toString();
    
    return apiFetch(`/retrieve/catalog?${queryString}`, {
      method: 'GET'
    });
  },
  create: (data) => apiFetch('/create/types', {
    method: 'POST',
    body: JSON.stringify(data),
  })
};

export const modelService = {
  getAll: (params) =>{
    const queryString = new URLSearchParams(params).toString();

    return apiFetch(`/retrieve/catalog?${queryString}`,{
      method:'GET'
    });
  },
  create: (data) => apiFetch('/create/models', {
    method: 'POST',
    body: JSON.stringify(data),
  })
};

export const incomesService = {
  getIncomes: () => apiFetch('/retrieve/incomes')
};

export const getUserInfo ={
  getInfo: () => apiFetch('/auth/user',{
    method: 'GET'
  })
}

export default apiFetch;