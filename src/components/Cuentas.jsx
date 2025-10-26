import React, { useEffect, useState } from "react";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import Loader from "./Loader";
import { API_BASE } from "./shared/apiBase";
import withAuth from "./withAuth";
import "../styles/Cuentas.css";

export default function Cuentas() {
	const [cuentas, setCuentas] = useState([]);
	const [loading, setLoading] = useState(false);
	const [editing, setEditing] = useState(null); // cuenta en edición
	const [form, setForm] = useState({ nombre: "", email: "", password: "", edad: "", peso: "", altura: "", sexo: "" });
	const [filter, setFilter] = useState("");

	useEffect(() => {
		loadCuentas();
	}, []);

	async function loadCuentas() {
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/admin/users`);
			if (!res.ok) throw new Error("Error al obtener cuentas");
			const data = await res.json();
			// data expected array
			setCuentas(Array.isArray(data) ? data : []);
		} catch (e) {
			console.error(e);
			window.notify?.("No se pudieron cargar las cuentas", { type: "error" });
		} finally {
			setLoading(false);
		}
	}

	function resetForm() {
		setEditing(null);
		setForm({ nombre: "", email: "", password: "", edad: "", peso: "", altura: "", sexo: "" });
	}

	function onEditClick(c) {
		setEditing(c);
		setForm({
			nombre: c.nombre || c.name || "",
			email: c.email || "",
			password: "",
			edad: c.edad ?? "",
			peso: c.peso ?? "",
			altura: c.altura ?? "",
			sexo: c.sexo || "",
		});
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	async function saveCuenta(e) {
		e?.preventDefault?.();
		setLoading(true);
		try {
			// Create or update
			if (editing) {
				const payload = { ...form };
				// don't send empty password
				if (!payload.password) delete payload.password;
				const res = await fetch(`${API_BASE}/admin/user/${editing.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error("No se pudo actualizar cuenta");
				window.notify?.("Cuenta actualizada", { type: "success" });
			} else {
				// create: force id_perfil = 3 (Doctor), and no alergias
				const payload = { ...form, id_perfil: 3, alergias: [] };
				const res = await fetch(`${API_BASE}/admin/users`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				if (!res.ok) {
					const err = await res.json().catch(() => ({}));
					throw new Error(err.message || "No se pudo crear la cuenta");
				}
				window.notify?.("Cuenta creada como Doctor", { type: "success" });
			}
			resetForm();
			await loadCuentas();
		} catch (err) {
			console.error(err);
			window.notify?.(err.message || "Error guardando cuenta", { type: "error" });
		} finally {
			setLoading(false);
		}
	}

	async function softDelete(cuenta) {
		if (!confirm(`¿Confirmar inactivar a ${cuenta.nombre || cuenta.email}?`)) return;
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/admin/user/${cuenta.id}/deactivate`, { method: "POST" });
			if (!res.ok) throw new Error("No se pudo inactivar");
			window.notify?.("Cuenta inactivada", { type: "success" });
			await loadCuentas();
		} catch (err) {
			console.error(err);
			window.notify?.("Error al inactivar cuenta", { type: "error" });
		} finally {
			setLoading(false);
		}
	}

	const visible = cuentas.filter(c => {
		if (!filter) return true;
		const f = filter.toLowerCase();
		return (c.nombre || c.name || "").toLowerCase().includes(f) || (c.email || "").toLowerCase().includes(f);
	});

	return (
		<div id="contenedorPrincipal" className="admin-cuentas-page">
			<Encabezado activePage="admin" onNavigate={(u) => { window.location.href = u }} />

			<main id="cuerpo">
				<div className="admin-header">
					<h1>Cuentas (Admin)</h1>
				</div>

				<section className="admin-form">
					<h2>{editing ? `Editar: ${editing.nombre || editing.email}` : "Crear cuenta (Doctor)"}</h2>
					<form onSubmit={saveCuenta}>
						<div className="grid-2">
							<div>
								<label>Nombre</label>
								<input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
							</div>
							<div>
								<label>Email</label>
								<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
							</div>
						</div>
						<div className="grid-3">
							<div>
								<label>Contraseña {editing ? "(dejar vacío para no cambiar)" : ""}</label>
								<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
							</div>
							<div>
								<label>Edad</label>
								<input type="number" value={form.edad} onChange={e => setForm({ ...form, edad: e.target.value })} />
							</div>
							<div>
								<label>Peso (kg)</label>
								<input type="number" step="any" value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} />
							</div>
						</div>
						<div className="grid-2">
							<div>
								<label>Altura (cm)</label>
								<input type="number" value={form.altura} onChange={e => setForm({ ...form, altura: e.target.value })} />
							</div>
							<div>
								<label>Sexo</label>
								<select value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })}>
									<option value="">--</option>
									<option value="masculino">Masculino</option>
									<option value="femenino">Femenino</option>
									<option value="otro">Otro</option>
								</select>
							</div>
						</div>

						<div className="form-actions">
							<button type="submit" className="btn-primary">{editing ? "Guardar cambios" : "Crear cuenta"}</button>
							<button type="button" className="btn-secondary" onClick={resetForm}>Cancelar</button>
						</div>
					</form>
				</section>

				<section className="admin-list">
					<div className="list-header">
						<input placeholder="Buscar por nombre o email" value={filter} onChange={e => setFilter(e.target.value)} />
					</div>

					<table className="table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Nombre</th>
								<th>Email</th>
								<th>Perfil</th>
								<th>Estado</th>
								<th>Edad</th>
								<th>Peso</th>
								<th>Altura</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							{visible.map(c => (
								<tr key={c.id} className={c.estado === 'inactivo' ? 'row-inactivo' : ''}>
									<td>{c.id}</td>
									<td>{c.nombre || c.name}</td>
									<td>{c.email}</td>
									<td>{c.id_perfil ?? c.perfil ?? '-'}</td>
									<td>{c.estado ?? '-'}</td>
									<td>{c.edad ?? '-'}</td>
									<td>{c.peso ?? '-'}</td>
									<td>{c.altura ?? '-'}</td>
									<td>
										<button onClick={() => onEditClick(c)}>Editar</button>
										<button onClick={() => softDelete(c)} className="btn-danger">Inactivar</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			</main>

			<Pie />
			<Loader visible={loading} />
		</div>
	);
}


