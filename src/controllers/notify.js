(function () {
  if (window.notify) return;

  const STYLE_ID = 'toastStyles';
  const CONTAINER_ID = 'toastContainer';

  function playSound() {
    try {
      const audio = new Audio('/public/Sonidos/notification.mp3');
      audio.volume = 0.5;
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
    el.style.right = '35%';
    el.style.bottom = '80%';
    return el;
  }

  function notify(message, opts) {
    playSound();
    injectStyles();

    const { type = 'info', duration = 3000 } = opts || {};
    const container = getContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Animar campana
    try {
      const bell = document.querySelector('.btnMenuNoti') || document.getElementById('btnNotification');
      if (bell) {
        bell.classList.remove('bell-hint');
        void bell.offsetWidth;
        bell.classList.add('bell-hint');
        setTimeout(() => bell.classList.remove('bell-hint'), 800);
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

  window.notify = notify;
})();