import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';

export function AdvisorsPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof api.advisors>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);

  function reload() {
    setLoading(true);
    api
      .advisors()
      .then(setRows)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setBusy(true);
    try {
      await api.createAdvisor(form);
      setForm({ displayName: '', email: '', password: '' });
      setOk('Asesor agregado correctamente.');
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear asesor.');
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(id: string, name: string) {
    if (!confirm(`¿Desactivar al asesor ${name}?`)) return;
    setError(null);
    try {
      await api.removeAdvisor(id);
      setOk('Asesor eliminado.');
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar.');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Asesores</h1>
        <p className="text-sm text-slate-400">Agrega o elimina asesores que recibirán contactos para llamadas.</p>
      </header>

      <Card title="Agregar asesor">
        <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nombre completo</label>
            <input
              className="input"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Correo</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Contraseña inicial</label>
            <input
              type="password"
              className="input max-w-md"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mín. 8 caracteres, letras y números"
              required
            />
          </div>
          {error && <p className="sm:col-span-2 text-sm text-danger">{error}</p>}
          {ok && <p className="sm:col-span-2 text-sm text-ok">{ok}</p>}
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary px-6" disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar asesor'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="Asesores activos">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400">
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400">
                    No hay asesores. Agrega uno arriba.
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium text-white">{a.displayName}</td>
                    <td>{a.email}</td>
                    <td className="text-right">
                      <button type="button" className="btn-danger text-xs" onClick={() => onRemove(a.id, a.displayName)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
