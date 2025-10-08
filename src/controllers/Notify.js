(function(){
  if (window.notify) return;

  const STYLE_ID = 'toastStyles';
  const CONTAINER_ID = 'toastContainer';

  function injectStyles(){
    if (document.getElementById(STYLE_ID)) return;
    const css = `
      .toast-container{position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;}
      .toast{min-width:220px;max-width:360px;padding:10px 14px;border-radius:12px;color:#fff;font-family:Inter, sans-serif;box-shadow:0 6px 16px rgba(0,0,0,0.2);opacity:0;transform:translateX(24px);animation:toast-in 150ms ease-out forwards;}
      .toast-message{white-space:pre-line;}
      .toast-info{background:linear-gradient(135deg,#3b82f6,#06b6d4)}
      .toast-success{background:linear-gradient(135deg,#16a34a,#22c55e)}
      .toast-error{background:linear-gradient(135deg,#b91c1c,#ef4444)}
      .toast-warning{background:linear-gradient(135deg,#a16207,#f59e0b)}
      .toast-close{margin-left:12px;cursor:pointer;background:transparent;border:none;color:#fff;font-size:16px}
      .toast-row{display:flex;align-items:start;gap:8px}
      .bell-hint{will-change:transform,filter;animation:bell-wiggle 700ms ease-in-out;filter:drop-shadow(0 0 6px rgba(255,65,108,0.6))}
      @keyframes bell-wiggle{0%{transform:rotate(0)}15%{transform:rotate(-16deg)}30%{transform:rotate(12deg)}45%{transform:rotate(-8deg)}60%{transform:rotate(5deg)}75%{transform:rotate(-2deg)}100%{transform:rotate(0)}}
      @keyframes toast-in{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
      @keyframes toast-out{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(24px)}}
    `;
    const style = document.createElement('style');
    style.id = STYLE_ID; style.textContent = css; document.head.appendChild(style);
  }

  function getContainer(){
    let el = document.getElementById(CONTAINER_ID);
    if (!el){
      el = document.createElement('div');
      el.id = CONTAINER_ID; el.className = 'toast-container';
      document.body.appendChild(el);
    }
    // Position container (fixed) near the bell when present, otherwise top-right
    function positionContainer(){
      try {
        const bell = document.querySelector('.btnMenuNoti') || document.getElementById('btnNotification');
        el.style.position = 'fixed';
        if (bell){
          const rect = bell.getBoundingClientRect();
          el.style.top = `${Math.round(rect.bottom + 8)}px`;
          // Use right offset instead of left to avoid drift based on container width
          const right = Math.max(16, Math.round(window.innerWidth - rect.right + 8));
          el.style.right = `${right}px`;
          el.style.left = 'auto';
        } else {
          el.style.top = '16px';
          el.style.right = '16px';
          el.style.left = 'auto';
        }
      } catch (_) {}
    }
    positionContainer();
    // Bind once for responsive repositioning
    if (!el.dataset.posBound){
      const handler = () => positionContainer();
      window.addEventListener('scroll', handler, { passive: true });
      window.addEventListener('resize', handler);
      el.dataset.posBound = '1';
    }
    return el;
  }

  function notify(message, opts){
    injectStyles();
    const { type = 'info', duration = 3000 } = opts || {};
    const container = getContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const row = document.createElement('div');
    row.className = 'toast-row';
    const span = document.createElement('span'); span.className = 'toast-message'; span.textContent = message;
    const btn = document.createElement('button'); btn.className = 'toast-close'; btn.innerHTML = '&times;';
    btn.addEventListener('click', () => dismiss());
    row.appendChild(span); row.appendChild(btn); toast.appendChild(row); container.appendChild(toast);

    // Subtle hint on the bell button
    try {
      const bell = document.querySelector('.btnMenuNoti') || document.getElementById('btnNotification');
      if (bell){
        bell.classList.remove('bell-hint');
        void bell.offsetWidth; // retrigger animation
        bell.classList.add('bell-hint');
        setTimeout(()=> bell.classList.remove('bell-hint'), 800);
      }
    } catch(_){}

    let hideTimer = null;
    function dismiss(){
      toast.style.animation = 'toast-out 120ms ease-in forwards';
      setTimeout(()=> toast.remove(), 140);
      if (hideTimer) clearTimeout(hideTimer);
    }
    hideTimer = setTimeout(dismiss, duration);
    return { dismiss };
  }

  window.notify = notify;
})();
