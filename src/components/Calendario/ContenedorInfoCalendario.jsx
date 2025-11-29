import '../../styles/Calendario.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../shared/apiBase';

const formatDate = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ContenedorInfoCalendario = ({ fecha, onClose, pesoDelDia, onWeightSaved }) => {
  const [info, setInfo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [pesoInput, setPesoInput] = useState('');
  const [saving, setSaving] = useState(false);
  const fechaStr = useMemo(() => formatDate(fecha), [fecha]);
  const todayStr = useMemo(() => formatDate(new Date()), []);
  const isFutureDate = useMemo(() => {
    if (!fechaStr || !todayStr) return false;
    return fechaStr > todayStr;
  }, [fechaStr, todayStr]);

  const isPastDate = useMemo(() => {
    if (!fechaStr || !todayStr) return false;
    return fechaStr < todayStr;
  }, [fechaStr, todayStr]);

  useEffect(() => {
    const usuarioRaw = localStorage.getItem('usuario') || localStorage.getItem('Usuario');
    if (!usuarioRaw) {
      setUserId(null);
      return;
    }
    try {
      const usuario = JSON.parse(usuarioRaw);
      setUserId(usuario?.id || usuario?._id || null);
    } catch (err) {
      console.warn('Error parseando usuario en localStorage', err);
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    if (pesoDelDia) {
      setPesoInput(prev => (prev ? prev : pesoDelDia));
    }
  }, [pesoDelDia]);

  // leer usuario local una vez para obtener `peso_inicial` si existe
  const usuarioLocal = (() => {
    try {
      const raw = localStorage.getItem('usuario') || localStorage.getItem('Usuario');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const pesoInicialLocal = usuarioLocal?.peso_inicial ?? null;

  const fetchDayInfo = useCallback(async () => {
    if (!fechaStr || !userId) return;
    setDayLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/calendario/${fechaStr}?userId=${userId}`);
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.message || 'No se pudo obtener la información del día');
      }
      const data = await res.json();
      setInfo(data);
      if (data?.peso) {
        setPesoInput(prev => (prev ? prev : data.peso));
      }
    } catch (err) {
      console.error('Error al obtener datos del día:', err);
      setInfo({ fecha: fechaStr, peso: null, dieta: null });
    } finally {
      setDayLoading(false);
    }
  }, [fechaStr, userId]);

  useEffect(() => {
    if (!fechaStr || !userId) return;
    fetchDayInfo();
  }, [fechaStr, userId, fetchDayInfo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId || !fechaStr || isFutureDate) return;
    const pesoValue = Number(pesoInput);
    if (Number.isNaN(pesoValue)) {
      window.notify?.('Ingrese un peso válido', { type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/user/${userId}/weights`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ peso: pesoValue, fecha: fechaStr }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'No se pudo guardar el peso');
      window.notify?.(data?.message || 'Peso guardado', { type: 'success' });
      onWeightSaved?.(fechaStr, pesoValue);
      // Actualizamos el peso en el perfil local SOLO si la API devolvió latestPeso (sincronizó)
      // o si la fecha guardada es hoy (por compatibilidad). Esto evita que editar días
      // anteriores cambie el peso del perfil.
      try {
        const rawLocal = localStorage.getItem('usuario') || localStorage.getItem('Usuario');
        if (rawLocal) {
          const usuario = JSON.parse(rawLocal);
          if (usuario) {
            const apiLatest = data?.latestPeso ?? null;
            const todayStrLocal = todayStr; // fecha de hoy en formato YYYY-MM-DD
            if (apiLatest !== null && apiLatest !== undefined) {
              usuario.peso = apiLatest;
            } else if (fechaStr === todayStrLocal) {
              // fallback: si la API no indicó latestPeso, pero el usuario guardó para hoy,
              // actualizar el perfil local
              usuario.peso = pesoValue;
            }

            // Persistir y notificar solo si el peso del perfil cambió
            if (usuario.peso !== undefined && usuario.peso !== null) {
              try { localStorage.setItem('usuario', JSON.stringify(usuario)); } catch {}
              try { window.dispatchEvent(new CustomEvent('usuario:updated', { detail: { usuario } })); } catch {}
            }
          }
        }
      } catch (err) {
        console.warn('No se pudo sincronizar localStorage con el nuevo peso', err);
      }
      await fetchDayInfo();
    } catch (err) {
      console.error(err);
      window.notify?.(err.message || 'Error al guardar el peso', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Peso del día real (registro). Si no hay registro, usar `peso_inicial` del usuario
  // como referencia; si tampoco existe, como último recurso mostrar el peso del perfil.
  const pesoDelPerfil = info?.pesoPerfil ?? null;
  const pesoMostrado = useMemo(() => {
    if (pesoDelDia) return Number(pesoDelDia);
    if (info?.peso && info?.pesoFuente === 'registro') return Number(info.peso);
    if (pesoInicialLocal !== null && pesoInicialLocal !== undefined) return Number(pesoInicialLocal);
    if (info?.peso && info?.pesoFuente === 'perfil') return Number(info.peso);
    return null;
  }, [info, pesoDelDia, pesoInicialLocal]);

  return (
    <div className="ModalOverlay" onClick={onClose}>
      <div className="ModalContent" onClick={e => e.stopPropagation()}>
        <button className="CerrarModal" onClick={onClose}>×</button>
        <h3>
          Información del {fecha ? fecha.toLocaleDateString() : 'día desconocido'}
        </h3>

        {dayLoading && <p>Cargando datos...</p>}

        {!dayLoading && (
          <div className="cal-info-block">
            <p><strong>Dieta:</strong> {info?.dieta?.nombre || 'Sin asignar'}</p>
            <p><strong>Peso:</strong> {
              pesoMostrado !== null
                ? `${Number(pesoMostrado).toFixed(1)} kg`
                : 'Sin registro'
            }</p>
            {(pesoMostrado === Number(pesoInicialLocal) && pesoInicialLocal !== null) && (
              <small className="cal-info-ayuda">Se muestra tu peso inicial como referencia. Registra el peso del día para guardarlo en el calendario.</small>
            )}
            {(pesoMostrado === Number(pesoDelPerfil) && pesoDelPerfil !== null && (pesoInicialLocal === null || pesoMostrado !== Number(pesoInicialLocal))) && (
              <small className="cal-info-ayuda">Se muestra el peso de tu perfil como referencia. Registra el peso del día para guardarlo en el calendario.</small>
            )}
          </div>
        )}

          {userId && fechaStr && !isFutureDate && !isPastDate && (
            <form className="cal-weight-form" onSubmit={handleSubmit}>
            <label>
              Peso (kg)
              <input
                type="number"
                step="0.1"
                min="30"
                max="170"
                value={pesoInput}
                onChange={(event) => setPesoInput(event.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar peso del día'}
            </button>
          </form>
        )}
        {isPastDate && (
          <div className="cal-info-ayuda">
            No puedes modificar registros de días anteriores al actual.
          </div>
        )}
        {isFutureDate && (
          <div className="cal-info-ayuda">
            No puedes registrar peso en fechas futuras.
          </div>
        )}

      </div>
    </div>
  );
};

export default ContenedorInfoCalendario;
