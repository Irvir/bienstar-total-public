/**
 * Notify.js - Sistema global de notificaciones toast
 * 
 * Proporciona:
 * - Notificaciones toast con animaciones y sonidos
 * - Diferentes tipos de notificación (info, success, error, warning)
 * - Función de redirección con notificación previa
 * - Estilos inyectados dinámicamente
 * - Animación de campanita en el botón de notificaciones
 */

(function () {
    // Evitar múltiples inyecciones del sistema de notificaciones
    if (window.notify) return;

    // ===== CONSTANTES =====
    
    const STYLE_ID = 'toastStyles';
    const CONTAINER_ID = 'toastContainer';

    // ===== FUNCIONES AUXILIARES =====

    /**
     * Muestra una notificación y luego redirige a otra página
     * Útil para flujos de login, registro, etc.
     * 
     * @param {string} message - Mensaje a mostrar
     * @param {Object} opts - Opciones de la notificación
     * @param {number} opts.duration - Duración en ms
     * @param {string} opts.type - Tipo de notificación
     * @param {string} redirectUrl - URL de destino
     * @param {Function} setLoading - Función para activar estado de carga (opcional)
     */
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
            // Fallback si notify no está disponible
            if (setLoading) setLoading(true);
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 700);
        }
    }

    /**
     * Reproduce un sonido según el tipo de notificación
     * 
     * @param {string} type - Tipo de notificación ('error' o cualquier otro)
     */
    function playSound(type = 'info') {
        try {
            let soundPath = '/public/Sonidos/Notification.mp3';
            if (type === 'error') {
                soundPath = '/public/Sonidos/NotificationError.mp3';
            }

            const audio = new Audio(soundPath);
            audio.volume = type === 'error' ? 0.6 : 0.5;
            
            audio.play().catch((err) => {
                console.warn('Autoplay bloqueado, el usuario debe interactuar antes:', err);
            });
        } catch (e) {
            console.warn('No se pudo reproducir el sonido:', e);
        }
    }

    /**
     * Inyecta los estilos CSS del sistema de notificaciones
     * Solo se ejecuta una vez gracias a la verificación del STYLE_ID
     */
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
            
            .toast-message { 
                white-space: pre-line; 
            }

            /* Estilos por tipo de notificación */
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

            /* Animaciones de entrada y salida */
            @keyframes toast-in {
                from { opacity: 0; transform: translateY(20px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes toast-out {
                from { opacity: 1; transform: translateY(0); }
                to   { opacity: 0; transform: translateY(20px); }
            }
            /* Animación de campanita (bell wiggle) */
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

    /**
     * Obtiene o crea el contenedor de toasts
     * El contenedor se posiciona centrado en la parte superior
     * 
     * @returns {HTMLElement} Contenedor de toasts
     */
    function getContainer() {
        let el = document.getElementById(CONTAINER_ID);
        
        if (!el) {
            el = document.createElement('div');
            el.id = CONTAINER_ID;
            el.className = 'toast-container';
            document.body.appendChild(el);
        }

        // Configurar posicionamiento centrado arriba
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

    /**
     * Muestra una notificación toast en pantalla
     * 
     * @param {string} message - Mensaje a mostrar
     * @param {Object} opts - Opciones de la notificación
     * @param {string} opts.type - Tipo: 'info', 'success', 'error', 'warning'
     * @param {number} opts.duration - Duración en milisegundos (default: 3000)
     * @returns {Object} Objeto con método dismiss() para cerrar manualmente
     */
    function notify(message, opts) {
        const { type = 'info', duration = 3000 } = opts || {};
        
        // Reproducir sonido de notificación
        playSound(type);
        
        // Inyectar estilos si no existen
        injectStyles();
        
        // Obtener contenedor
        const container = getContainer();

        // Crear elemento toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Animar campanita de notificaciones si existe
        try {
            const bell = document.querySelector('.btnMenuNoti') || 
                        document.getElementById('btnNotification');
            
            if (bell) {
                bell.classList.remove('bell-hint');
                void bell.offsetWidth; // Forzar reflow para reiniciar animación
                bell.classList.add('bell-hint');
                
                setTimeout(() => bell.classList.remove('bell-hint'), 800);

                bell.style.position = ''; // Mantener posición natural
                bell.style.transition = ''; // Sin transición extra
            }
        } catch {
            // Ignorar si no existe el botón de notificaciones
        }

        // Crear contenido del toast
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
        
        /**
         * Cierra el toast con animación de salida
         */
        function dismiss() {
            toast.style.animation = 'toast-out 150ms ease-in forwards';
            setTimeout(() => toast.remove(), 180);
            if (hideTimer) clearTimeout(hideTimer);
        }
        
        // Auto-cerrar después de la duración especificada
        hideTimer = setTimeout(dismiss, duration);
        
        return { dismiss };
    }

    // Exportar funciones al objeto global window
    window.notifyThenRedirect = notifyThenRedirect;
    window.notify = notify;

})();