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
      const res = await fetch(`${API_BASE}/user/${userId}/weights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peso: pesoValue, fecha: fechaStr }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'No se pudo guardar el peso');
      window.notify?.(data?.message || 'Peso guardado', { type: 'success' });
      onWeightSaved?.(fechaStr, pesoValue);
      await fetchDayInfo();
    } catch (err) {
      console.error(err);
      window.notify?.(err.message || 'Error al guardar el peso', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const pesoMostrado = useMemo(() => {
    if (info?.peso) return info.peso;
    if (pesoDelDia) return pesoDelDia;
    return null;
  }, [info, pesoDelDia]);

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
            <p><strong>Peso:</strong> {pesoMostrado ? `${Number(pesoMostrado).toFixed(1)} kg` : 'Sin registro'}</p>
            {info?.pesoFuente === 'perfil' && !pesoDelDia && (
              <small className="cal-info-ayuda">Mostrando el peso de tu perfil. Registra el peso del día para un seguimiento más preciso.</small>
            )}
          </div>
        )}

        {userId && fechaStr && !isFutureDate && (
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
