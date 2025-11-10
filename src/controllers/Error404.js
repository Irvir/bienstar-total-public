(()=>{
  // Si el elemento #root existe, la app React está montada y debe controlar el 404
  if (typeof document !== 'undefined' && document.getElementById && document.getElementById('root')) {
    // No hacemos la redirección estática; React se encarga del enrutado/404
    return;
  }

  const rutasValidas = [
    'index.html',
    'home.html',
    'perfil.html',
    'dietas.html',
    'alimentos.html',
    'calendario.html',
    'tipsParaTuDieta.html',
    'login.html',
    'CrearCuenta.html',
    'CrearDieta.html',
    'error404.html',
    'Pruebas.html',
    'base.html',
  ].map(r => r.toLowerCase());

  // Obtener último segmento sin extensión y sin query/hash, normalizar a minúsculas
  let rutaActual = window.location.pathname.split('/').pop() || '';
  rutaActual = rutaActual.split('?')[0].split('#')[0].toLowerCase();

  // Si la ruta está vacía (root '/') tratar como index.html
  if (!rutaActual || rutaActual === '') rutaActual = 'index.html';

  // Si la ruta es 'home' o 'home.html' tratar como index.html (alias)
  if (rutaActual === 'home' || rutaActual === 'home.html') rutaActual = 'index.html';

  // Si no tiene extensión .html, añadirla
  if (!rutaActual.endsWith('.html')) rutaActual += '.html';

  // Redirigir solo si no es válida
  if (!rutasValidas.includes(rutaActual)) {
    // Usa ruta relativa para no depender de un path absoluto del repo
    window.location.href = '/frontEnd/src/pages/error404.html';
  }
})();