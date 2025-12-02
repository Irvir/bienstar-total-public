/**
 * Fetch con autenticación automática
 * Agrega el token JWT del localStorage a todas las peticiones
 */
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si el token expiró o es inválido, limpiar sesión
  if (response.status === 401) {
    console.warn('Token inválido o expirado');
  }

  return response;
}

export default authFetch;
