(function () {
  if (window.notify) return;

  const STYLE_ID = 'toastStyles';
  const CONTAINER_ID = 'toastContainer';
  function notifyThenRedirect(message, opts, redirectUrl, setLoading) {
    const { duration = 3000, type = "info" } = opts || {};

    if (window.notify) {
      window.notify(message, { type, duration });

      setTimeout(() => {
        if (setLoading) setLoading(true);
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 700);
      }, duration);
    } else {
      if (setLoading) setLoading(true);
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 700);
    }
  }

  function playSound(type = 'info') {
    try {
      // En producción Vite sirve los archivos de `public/` en la raíz del sitio,
      // por lo que no debemos incluir "public" en la ruta.
      let soundPath = '/Sonidos/Notification.mp3';
      if (type === 'error') soundPath = '/Sonidos/NotificationError.mp3';

      const audio = new Audio(soundPath);
      audio.volume = type === 'error' ? 0.6 : 0.5;
      audio.play().catch((err) => {
        console.warn('Autoplay bloqueado, el usuario debe interactuar antes:', err);
      });
    } catch (e) {
      console.warn('No se pudo reproducir el sonido:', e);
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
      .toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
        pointer-events: none; /* allow clicks through the container */
      }
      .toast {
        position: relative;
        min-width: 220px;
        max-width: 360px;
        padding: 10px 14px;
        border-radius: 12px;
        color: #fff;
        font-family: Inter, sans-serif;
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateY(20px);
        animation: toast-in 180ms ease-out forwards;
        pointer-events: auto; /* allow interaction with the toast itself */
      }
      .toast-message { white-space: pre-line; }

      .toast-info    { background: linear-gradient(135deg,#3b82f6,#06b6d4); }
      .toast-success { background: linear-gradient(135deg,#16a34a,#22c55e); }
      .toast-error   { background: linear-gradient(135deg,#b91c1c,#ef4444); }
      .toast-warning { background: linear-gradient(135deg,#a16207,#f59e0b); }

      .toast-close {
        background: transparent;
        border: none;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        margin-left: 1rem;
        pointer-events: auto; /* ensure close button works */
      }

      .toast-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      @keyframes toast-in {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes toast-out {
        from { opacity: 1; transform: translateY(0); }
        to   { opacity: 0; transform: translateY(20px); }
      }

      @keyframes bell-wiggle {
        0%   { transform: rotate(0deg); }
        15%  { transform: rotate(-16deg); }
        30%  { transform: rotate(12deg); }
        45%  { transform: rotate(-8deg); }
        60%  { transform: rotate(5deg); }
        75%  { transform: rotate(-2deg); }
        100% { transform: rotate(0deg); }
      }

      .bell-hint {
        animation: bell-wiggle 700ms ease-in-out;
        filter: drop-shadow(0 0 6px rgba(255,65,108,0.6));
      }
    `;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getContainer() {
    let el = document.getElementById(CONTAINER_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = CONTAINER_ID;
      el.className = 'toast-container';
      document.body.appendChild(el);
    }

    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.top = '10%';
    el.style.transform = 'translateX(-50%)';
    el.style.zIndex = '9999';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.alignItems = 'center';
    el.style.gap = '8px';

    return el;
  }

  function notify(message, opts) {

    const { type = 'info', duration = 3000 } = opts || {};
    playSound(type);
    injectStyles();
    const container = getContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    try {
      const bell = document.querySelector('.btnMenuNoti') || document.getElementById('btnNotification');
      if (bell) {
        bell.classList.remove('bell-hint');
        void bell.offsetWidth; // Reinicia animación
        bell.classList.add('bell-hint');
        setTimeout(() => bell.classList.remove('bell-hint'), 800);


        bell.style.position = ''; // Se mantiene su posición natural
        bell.style.transition = ''; // No transición extra
      }
    } catch (_) { }

    // Contenido del toast
    const span = document.createElement('span');
    span.className = 'toast-message';
    span.textContent = message;

    const btn = document.createElement('button');
    btn.className = 'toast-close';
    btn.innerHTML = '&times;';
    btn.addEventListener('click', () => dismiss());

    const row = document.createElement('div');
    row.className = 'toast-row';
    row.appendChild(span);
    row.appendChild(btn);
    toast.appendChild(row);
    container.appendChild(toast);

    let hideTimer = null;
    function dismiss() {
      toast.style.animation = 'toast-out 150ms ease-in forwards';
      setTimeout(() => toast.remove(), 180);
      if (hideTimer) clearTimeout(hideTimer);
    }
    hideTimer = setTimeout(dismiss, duration);
    return { dismiss };
  }

  // notifyConfirm: muestra mensaje con botones Confirmar / Cancelar.
  // No reproduce sonido al mostrarse. Reproduce sonido solo cuando el usuario
  // pulsa Confirmar (antes de llamar onConfirm), según la petición del usuario.
  function notifyConfirm(message, opts, onConfirm, onCancel) {
    const { type = 'warning', duration = 0 } = opts || {};
    injectStyles();
    const container = getContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const span = document.createElement('span');
    span.className = 'toast-message';
    span.textContent = message;

    // actions container
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.marginTop = '8px';

    const btnConfirm = document.createElement('button');
    btnConfirm.textContent = 'Confirmar';
    btnConfirm.className = 'toast-action-confirm';
    btnConfirm.style.padding = '8px 12px';
    btnConfirm.style.borderRadius = '8px';
    btnConfirm.style.border = 'none';
    btnConfirm.style.cursor = 'pointer';
    btnConfirm.style.fontWeight = '700';
    btnConfirm.style.background = 'linear-gradient(135deg,#b91c1c,#ef4444)';
    btnConfirm.style.color = '#fff';

    const btnCancel = document.createElement('button');
    btnCancel.textContent = 'Cancelar';
    btnCancel.className = 'toast-action-cancel';
    btnCancel.style.padding = '8px 12px';
    btnCancel.style.borderRadius = '8px';
    btnCancel.style.border = 'none';
    btnCancel.style.cursor = 'pointer';
    btnCancel.style.background = 'rgba(255,255,255,0.12)';
    btnCancel.style.color = '#fff';

    actions.appendChild(btnConfirm);
    actions.appendChild(btnCancel);

    const row = document.createElement('div');
    row.className = 'toast-row';
    row.style.flexDirection = 'column';
    row.style.alignItems = 'stretch';
    row.appendChild(span);
    row.appendChild(actions);

    toast.appendChild(row);
    container.appendChild(toast);

    function dismiss() {
      toast.style.animation = 'toast-out 150ms ease-in forwards';
      setTimeout(() => toast.remove(), 180);
    }

    btnConfirm.addEventListener('click', async () => {
      try {
        // reproducir sonido justo antes de invocar el callback de confirmación
        try { playSound(type); } catch (e) { /* ignore */ }
        if (typeof onConfirm === 'function') await onConfirm();
      } catch (e) {
        console.error('Error en onConfirm:', e);
      }
      dismiss();
    });

    btnCancel.addEventListener('click', () => {
      try {
        if (typeof onCancel === 'function') onCancel();
      } catch (e) {
        console.error('Error en onCancel:', e);
      }
      dismiss();
    });

    if (duration && duration > 0) setTimeout(dismiss, duration);

    return { dismiss };
  }

  window.notifyThenRedirect = notifyThenRedirect;

  window.notify = notify;
  window.notifyConfirm = notifyConfirm;

})();