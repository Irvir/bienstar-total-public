import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/Perfil.css';
import { API_BASE } from '../shared/apiBase';

const buildInitialForm = () => ({
  fecha: new Date().toISOString().split('T')[0],
  peso: '',
});

export default function WeightHistory({
  userId,
  onPesoActualizado,
  variant = 'full',
  maxItems = 90,
  onChange,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(buildInitialForm);
  const [error, setError] = useState(null);

  const isCompact = variant === 'compact';
  const cardClass = `weight-history-card${isCompact ? ' compact' : ''}`;
  const formDisabled = !userId;

  const promedioLabel = useMemo(
    () => (maxItems >= 90 ? 'Promedio 90 días' : `Promedio ${maxItems} registros`),
    [maxItems],
  );

  useEffect(() => {
    if (!userId) return;
    let active = true;

    const fetchWeights = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/user/${userId}/weights?limit=${maxItems}`);
        if (!res.ok) throw new Error('No se pudo cargar el historial');
        const data = await res.json();
        if (!active) return;
        const normalized = Array.isArray(data.items)
          ? [...data.items].sort((a, b) => (a.fecha > b.fecha ? 1 : -1))
          : [];
        setItems(normalized);
        setError(null);
      } catch (err) {
        if (!active) return;
        console.error(err);
        setError(err.message || 'Error al cargar datos');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchWeights();
    return () => {
      active = false;
    };
  }, [userId, maxItems]);

  const pesoPromedio = useMemo(() => {
    if (!items.length) return null;
    const total = items.reduce((acc, entry) => acc + Number(entry.peso || 0), 0);
    return (total / items.length).toFixed(1);
  }, [items]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId || !form.peso) {
      window.notify?.('Ingrese un peso válido', { type: 'warning' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/user/${userId}/weights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peso: Number(form.peso), fecha: form.fecha }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'No se pudo guardar');

      window.notify?.(data.message || 'Peso guardado', { type: 'success' });
      setItems(prev => {
        const filtered = prev.filter(entry => entry.fecha !== data?.item?.fecha);
        const updated = data?.item ? [...filtered, data.item] : filtered;
        return updated.sort((a, b) => (a.fecha > b.fecha ? 1 : -1));
      });
      if (typeof onPesoActualizado === 'function' && data?.latestPeso !== undefined) {
        onPesoActualizado(data.latestPeso);
      }
      onChange?.({ type: 'upsert', payload: data });
      setForm(prev => ({ ...prev, peso: '' }));
    } catch (err) {
      console.error(err);
      window.notify?.(err.message || 'Error al guardar', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!userId || !id) return;
    if (!window.confirm('¿Desea eliminar este registro de peso?')) return;

    try {
      const res = await fetch(`${API_BASE}/user/${userId}/weights/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'No se pudo eliminar');

      window.notify?.('Registro eliminado', { type: 'success' });
      setItems(prev => prev.filter(entry => entry.id !== id));
      if (typeof onPesoActualizado === 'function' && data?.latestPeso !== undefined) {
        onPesoActualizado(data.latestPeso);
      }
      onChange?.({ type: 'delete', payload: data });
    } catch (err) {
      console.error(err);
      window.notify?.(err.message || 'Error al eliminar', { type: 'error' });
    }
  };

  const lastPeso = items.length ? items[0].peso : null;

  return (
    <section className={cardClass}>
      <header className="weight-history-header">
        <div>
          <h3>{isCompact ? 'Peso del día' : 'Historial de Peso'}</h3>
          {!isCompact && <p>Sigue tu progreso guardando tu peso por fecha.</p>}
          {isCompact && <small>Registra tu peso sin salir del calendario.</small>}
        </div>
        {pesoPromedio && !isCompact && (
          <div className="weight-history-stat">
            <span>{promedioLabel}</span>
            <strong>{pesoPromedio} kg</strong>
          </div>
        )}
      </header>

      <form className="weight-history-form" onSubmit={handleSubmit}>
        <label>
          Fecha
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            max={new Date().toISOString().split('T')[0]}
            onChange={handleFormChange}
            required
            disabled={formDisabled}
          />
        </label>
        <label>
          Peso (kg)
          <input
            type="number"
            name="peso"
            step="0.1"
            min="30"
            max="170"
            value={form.peso}
            onChange={handleFormChange}
            placeholder={lastPeso ?? ''}
            required
            disabled={formDisabled}
          />
        </label>
        <button type="submit" disabled={saving || formDisabled}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </form>

      {formDisabled && (
        <p className="weight-history-empty">Inicia sesión para registrar tu peso.</p>
      )}

      {error && <p className="weight-history-error">{error}</p>}
      {!formDisabled && (
        loading ? (
          <p className="weight-history-loading">Cargando historial…</p>
        ) : items.length === 0 ? (
          <p className="weight-history-empty">Aún no registras tu peso. ¡Comienza hoy!</p>
        ) : (
          <div className="weight-history-table-wrapper">
            <table className="weight-history-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(entry => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.fecha).toLocaleDateString()}</td>
                    <td>{Number(entry.peso).toFixed(1)} kg</td>
                    <td>
                      <button
                        type="button"
                        className="weight-history-delete"
                        onClick={() => handleDelete(entry.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </section>
  );
}
