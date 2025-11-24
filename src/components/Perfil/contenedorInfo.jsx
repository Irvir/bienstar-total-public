import React, { useState, useEffect } from 'react';
import '../../styles/Perfil.css';

export default function ContenedorInfo({ usuario, onActualizarUsuario }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    edad: '',
    peso: '',
    altura: '',
    actividad_fisica: '',
    sexo: '',
    email: '',
    alergias: [],
    otrasAlergias: '',
  });

  const getUserEmail = (u) => {
    if (!u) return null;
    if (u.email) return u.email;
    if (u.emailAddress) return u.emailAddress;
    if (u.emails && Array.isArray(u.emails) && u.emails.length > 0) {
      const e = u.emails[0];
      if (e && (e.value || e.email)) return e.value || e.email;
    }
    if (u.user && u.user.email) return u.user.email;
    if (u.profile && u.profile.email) return u.profile.email;
    if (u.auth && u.auth.email) return u.auth.email;
    return null;
  };

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || '',
        edad: usuario.edad ?? '',
        peso: usuario.peso ?? '',
        altura: usuario.altura ?? '',
        actividad_fisica: usuario.actividad_fisica || '',
        sexo: usuario.sexo || '',
        email: getUserEmail(usuario) || '',
        alergias: Array.isArray(usuario.alergias)
          ? usuario.alergias
          : (usuario.alergias ? [usuario.alergias] : []),
        otrasAlergias: '',
      });
    }
  }, [usuario]);

  const startEdit = () => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || '',
        edad: usuario.edad ?? '',
        peso: usuario.peso ?? '',
        altura: usuario.altura ?? '',
        actividad_fisica: usuario.actividad_fisica || '',
        sexo: usuario.sexo || '',
        email: getUserEmail(usuario) || '',
        alergias: Array.isArray(usuario.alergias)
          ? usuario.alergias
          : (usuario.alergias ? [usuario.alergias] : []),
        otrasAlergias: '',
      });
    }
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || '',
        edad: usuario.edad ?? '',
        peso: usuario.peso ?? '',
        altura: usuario.altura ?? '',
        actividad_fisica: usuario.actividad_fisica || '',
        sexo: usuario.sexo || '',
        email: getUserEmail(usuario) || '',
        alergias: Array.isArray(usuario.alergias)
          ? usuario.alergias
          : (usuario.alergias ? [usuario.alergias] : []),
        otrasAlergias: '',
      });
    }
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.nombre.trim()) return { ok: false, message: 'El nombre no puede estar vacío' };

    const edad = form.edad === '' ? null : Number(form.edad);
    if (edad !== null && (edad < 16 || edad > 99)) return { ok: false, message: 'Edad entre 16 y 99' };

    const peso = form.peso === '' ? null : Number(form.peso);
    if (peso !== null && (peso < 31 || peso > 169)) return { ok: false, message: 'Peso entre 31 y 169 kg' };

    let altura = form.altura === '' ? null : Number(form.altura);
    if (altura !== null) {
      if (altura < 10) altura = altura * 100; // metros a cm
      if (altura < 81 || altura > 249) return { ok: false, message: 'Altura entre 81 y 249 cm' };
    }

    return { ok: true };
  };

  const saveEdit = async () => {
    const v = validateForm();
    if (!v.ok) {
      window.notify?.(v.message, { type: 'error' });
      return;
    }

    let finalAlergias = [...form.alergias];
    if (form.otrasAlergias && form.otrasAlergias.trim()) {
      finalAlergias.push(form.otrasAlergias.trim());
    }

    const payload = {
      nombre: form.nombre.trim(),
      edad: form.edad === '' ? null : Number(form.edad),
      peso: form.peso === '' ? null : Number(form.peso),
      altura: form.altura === '' ? null : Number(form.altura < 10 ? form.altura * 100 : form.altura),
      actividad_fisica: form.actividad_fisica,
      sexo: form.sexo,
      alergias: finalAlergias,
    };

    try {
      if (usuario?.id) {
        const res = await fetch(`http://localhost:3001/user/${usuario.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const serverUser = data.usuario || data.user || null;
          let updatedUser = serverUser;

          if (!updatedUser) {
            updatedUser = { ...(usuario || {}), ...payload };
          }

          const existingEmail = getUserEmail(usuario) || (() => {
            try {
              const raw = localStorage.getItem('usuario');
              if (!raw) return null;
              const parsed = JSON.parse(raw);
              return getUserEmail(parsed);
            } catch {
              return null;
            }
          })();

          if (!updatedUser.email && existingEmail) {
            updatedUser.email = existingEmail;
          }

          onActualizarUsuario?.(updatedUser);

          setForm({
            nombre: updatedUser.nombre || '',
            edad: updatedUser.edad ?? '',
            peso: updatedUser.peso ?? '',
            altura: updatedUser.altura ?? '',
            actividad_fisica: updatedUser.actividad_fisica || '',
            sexo: updatedUser.sexo || '',
            email: getUserEmail(updatedUser) || '',
            alergias: Array.isArray(updatedUser.alergias)
              ? updatedUser.alergias
              : (updatedUser.alergias ? [updatedUser.alergias] : []),
            otrasAlergias: '',
          });

          window.notify?.('Perfil actualizado', { type: 'success' });
          setEditMode(false);
        } else {
          const err = await res.json().catch(() => ({}));
          window.notify?.(err.message || 'No se pudo actualizar', { type: 'error' });
        }
      }
    } catch (err) {
      console.error(err);
      window.notify?.('Error de conexión con el servidor', { type: 'error' });
    }
  };

  const etiquetas = {
    nombre: '👤 Nombre:',
    edad: '🎂 Edad:',
    peso: '⚖️ Peso:',
    altura: '📏 Altura:',
    email: '📧 Correo:',
  };

  const getDisplayValue = (campo) => {
    if (!usuario) return '-';
    if (campo === 'email') return getUserEmail(usuario) || '-';
    return usuario[campo] ?? '-';
  };

  const allergyIcons = {
    'gluten': '🍞',
    'lactosa': '🥛',
    'frutos_secos': '🥜',
    'mariscos': '🦐',
    'ninguna': '✅',
  };

  const getAllergyIcon = (alergia) => {
    const key = alergia.toLowerCase().replace(/ /g, '_');
    return allergyIcons[key] || '⚠️';
  };

  return (
    <div id="contenedorInfoSesion" className={editMode ? 'is-editing' : ''}>
      <div id="contenedorInfo">
        <div id="tituloInfoRow">
          <div id="tituloInfo">Información de usuario:</div>
          {!editMode ? (
            <button className="btnEditarPerfil" onClick={startEdit}>
              <span>Editar</span>
            </button>
          ) : (
            <div className="accionesEditarPerfil">
              <button className="btnGuardarPerfil" onClick={saveEdit}>
                💾 Guardar
              </button>
              <button className="btnCancelarPerfil" onClick={cancelEdit}>
                ❌ Cancelar
              </button>
            </div>
          )}
        </div>

        {Object.keys(etiquetas).map((campo, idx) => (
          <div className={'datoUsuarioRow' + (idx === 0 ? ' first-row' : '')} key={campo}>
            <div className="info">{etiquetas[campo]}</div>
            {editMode ? (
              <input
                type={['edad', 'peso', 'altura'].includes(campo) ? 'number' : (campo === 'email' ? 'email' : 'text')}
                name={campo}
                value={form[campo]}
                onChange={handleChange}
                min={campo === 'edad' ? 16 : undefined}
                max={campo === 'edad' ? 99 : undefined}
                step={['peso', 'altura'].includes(campo) ? 0.1 : undefined}
                readOnly={campo === 'email'} // se ve en el input, pero no editable
              />
            ) : (
              <span className='infoUsuario'>{getDisplayValue(campo)}</span>
            )}
          </div>
        ))}

        {/* Sexo */}
        <div className="datoUsuarioRow">
          <div className="info">⚧ Sexo:</div>
          {editMode ? (
            <select name="sexo" value={form.sexo} onChange={handleChange} className="select-control" style={{ marginTop: 0 }}>
              <option value="">Seleccione</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          ) : (
            <span className='infoUsuario'>{usuario?.sexo || '-'}</span>
          )}
        </div>

        {/* Actividad física */}
        <div className="datoUsuarioRow">
          <div className="info">🏃 Actividad Física:</div>
          {editMode ? (
            <select name="actividad_fisica" value={form.actividad_fisica} onChange={handleChange} className="select-control" style={{ marginTop: 0 }}>
              <option value="">Seleccione</option>
              <option value="sedentario">Sedentario</option>
              <option value="ligero">Ligero</option>
              <option value="moderado">Moderado</option>
              <option value="intenso">Intenso</option>
            </select>
          ) : (
            <span className='infoUsuario'>{usuario?.actividad_fisica || '-'}</span>
          )}
        </div>

        {/* Alergias */}
        <div className="datoUsuarioRow" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div className="info" style={{ marginBottom: '8px' }}>🥜 Alergias:</div>
          {editMode ? (
            <div className="alergias-wrapper">
              <select
                className="select-control"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v && !form.alergias.includes(v)) {
                    setForm((p) => ({ ...p, alergias: [...p.alergias, v] }));
                  }
                  e.target.selectedIndex = 0;
                }}
              >
                <option value="">Seleccione alergia...</option>
                <option value="gluten">Gluten</option>
                <option value="lactosa">Lactosa</option>
                <option value="frutos_secos">Frutos secos</option>
                <option value="mariscos">Mariscos</option>
                <option value="ninguna">Ninguna</option>
              </select>

              <div className="alergias-lista">
                {form.alergias.length === 0 ? (
                  <p className="alergias-empty">No hay alergias seleccionadas.</p>
                ) : (
                  form.alergias.map((a, i) => (
                    <span key={i} className="chip">
                      {getAllergyIcon(a)} {a}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            alergias: p.alergias.filter((x) => x !== a),
                          }))
                        }
                      >
                        ❌
                      </button>
                    </span>
                  ))
                )}
              </div>

              <input
                type="text"
                name="otrasAlergias"
                value={form.otrasAlergias}
                onChange={handleChange}
                placeholder="Otras alergias (escribir y guardar)"
                style={{ marginTop: '10px' }}
              />
            </div>
          ) : (
            <div className="alergias-lista">
              {(!usuario?.alergias || (Array.isArray(usuario.alergias) && usuario.alergias.length === 0)) ? (
                <span className='infoUsuario'>-</span>
              ) : (
                (Array.isArray(usuario.alergias) ? usuario.alergias : [usuario.alergias]).map((a, i) => (
                  <span key={i} className="chip" style={{ paddingRight: '10px' }}>
                    {getAllergyIcon(a)} {a}
                  </span>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
