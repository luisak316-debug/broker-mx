import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useClientAuth } from '../auth/ClientAuthContext';
import { Card } from '../components/common/Card';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { resolveUploadUrl } from '../lib/apiConfig';
import {
  DOCUMENT_TYPE_LABEL,
  fmtDate,
  fmtDateTime,
  fmtPhone,
  KYC_STATUS_LABEL,
} from '../lib/format';
import type { ClientProfileData } from '../types';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) reject(new Error('No se pudo leer el archivo.'));
      else resolve(base64);
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

function formatAccountEmail(email: string, phone: string): string {
  if (email.includes('@celular.brokermx')) {
    return phone ? `Cuenta vinculada al celular ${fmtPhone(phone)}` : 'Cuenta vinculada a tu celular';
  }
  return email;
}

function kycTone(status: string): string {
  if (status === 'APPROVED') return 'text-ok';
  if (status === 'REJECTED') return 'text-bear';
  if (status === 'IN_REVIEW') return 'text-amber-300';
  return 'text-slate-400';
}

export function Profile() {
  const { client, updateProfilePhoto, refreshSession } = useClientAuth();
  const [profile, setProfile] = useState<ClientProfileData | null>(null);
  const [city, setCity] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [docType, setDocType] = useState('INE');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docBusy, setDocBusy] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (profile?.displayName ?? client?.displayName ?? 'Cliente')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  function load() {
    if (!client?.id) return;
    setLoading(true);
    setError(null);
    api
      .getProfile(client.id)
      .then((p) => {
        setProfile(p);
        setCity(p.city ?? '');
        setHomeAddress(p.homeAddress ?? '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar tu perfil.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [client?.id]);

  async function saveProfile() {
    if (!client?.id) return;
    setSaving(true);
    setFeedback(null);
    setError(null);
    try {
      const updated = await api.updateProfile(client.id, {
        city: city.trim() || null,
        homeAddress: homeAddress.trim() || null,
      });
      setProfile(updated);
      await refreshSession();
      setFeedback('Datos guardados correctamente.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron guardar los datos.');
    } finally {
      setSaving(false);
    }
  }

  function onDocumentFileChange(file: File | null) {
    if (!file) {
      setDocFile(null);
      return;
    }
    const ok =
      /\.(pdf|png|jpe?g|webp|gif)$/i.test(file.name) ||
      /^(application\/pdf|image\/(png|jpeg|jpg|webp|gif))$/i.test(file.type);
    if (!ok) {
      setDocError('Formato no permitido. Usa PDF, PNG, JPG o WEBP.');
      setDocFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocError('El archivo no debe superar 10 MB.');
      setDocFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setDocError(null);
    setDocFile(file);
  }

  async function uploadDocument() {
    if (!client?.id || !docFile) {
      setDocError('Selecciona un archivo PDF o imagen.');
      return;
    }
    setDocBusy(true);
    setDocError(null);
    try {
      const data = await readFileAsBase64(docFile);
      const res = await api.uploadDocument(client.id, {
        type: docType,
        fileName: docFile.name,
        mimeType: docFile.type || 'application/octet-stream',
        data,
      });
      setProfile((prev) =>
        prev ? { ...prev, documents: [res.document, ...prev.documents] } : prev,
      );
      setDocFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFeedback('Documento cargado. Lo revisaremos para completar tu verificación.');
      await refreshSession();
    } catch (e) {
      setDocError(e instanceof Error ? e.message : 'Error al subir el documento.');
    } finally {
      setDocBusy(false);
    }
  }

  if (!client) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link to="/app" className="text-sm text-brand-400 hover:underline">
          ← Volver al inicio
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Mi perfil</h1>
        <p className="text-sm text-slate-400">
          Administra tu información personal y sube tus documentos de identidad.
        </p>
      </header>

      {feedback && (
        <div className="rounded-lg border border-brand-500/40 bg-brand-600/15 px-3 py-2 text-sm text-brand-100">
          {feedback}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-bear/40 bg-bear/15 px-3 py-2 text-sm text-bear">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-400">Cargando perfil…</p>
      ) : profile ? (
        <>
          <Card className="text-center">
            <div className="flex flex-col items-center gap-3">
              <ProfileAvatar
                photoUrl={profile.profilePhotoUrl || client.profilePhotoUrl}
                initials={initials}
                onPhotoSaved={updateProfilePhoto}
                size="lg"
              />
              <div>
                <h2 className="text-xl font-bold text-white">{profile.displayName}</h2>
                <p className={`mt-1 text-sm font-medium ${kycTone(profile.kycStatus)}`}>
                  Verificación: {KYC_STATUS_LABEL[profile.kycStatus] ?? profile.kycStatus}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Datos personales">
            <dl className="space-y-3 text-sm">
              <Row label="Teléfono" value={fmtPhone(profile.phone)} />
              <Row label="Correo" value={formatAccountEmail(profile.email, profile.phone)} />
              <Row label="Cliente desde" value={fmtDate(profile.createdAt)} />
            </dl>

            <div className="mt-4 space-y-3 border-t border-ink-600/60 pt-4">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Ciudad</span>
                <input
                  className="input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej. Guadalajara, Jalisco"
                  maxLength={120}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Domicilio</span>
                <textarea
                  className="input min-h-[88px] resize-y"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder="Calle, número, colonia, CP…"
                  maxLength={500}
                />
              </label>
              <button
                type="button"
                className="btn-primary"
                disabled={saving}
                onClick={() => void saveProfile()}
              >
                {saving ? 'Guardando…' : 'Guardar datos'}
              </button>
            </div>
          </Card>

          <Card title="Documentos de identidad">
            <p className="mb-4 text-sm text-slate-400">
              Sube tu identificación oficial (INE, pasaporte, comprobante de domicilio, etc.) en PDF
              o imagen. Solo tú puedes cargar estos documentos.
            </p>

            <div className="mb-4 space-y-3 rounded-lg border border-ink-600 bg-ink-900/40 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-300">Tipo de documento</span>
                  <select
                    className="input"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    {Object.entries(DOCUMENT_TYPE_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-300">
                    Archivo (PDF, PNG, JPG, WEBP · máx. 10 MB)
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
                    className="input cursor-pointer file:mr-2 file:rounded file:border-0 file:bg-brand-600 file:px-2 file:py-1 file:text-xs file:text-white"
                    onChange={(e) => onDocumentFileChange(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              {docFile && (
                <p className="text-xs text-slate-400">
                  Seleccionado: <span className="text-slate-200">{docFile.name}</span> (
                  {(docFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
              {docError && (
                <p className="rounded-lg bg-bear/15 px-3 py-2 text-xs text-bear">{docError}</p>
              )}
              <button
                type="button"
                className="btn-primary"
                disabled={!docFile || docBusy}
                onClick={() => void uploadDocument()}
              >
                {docBusy ? 'Subiendo…' : 'Subir documento'}
              </button>
            </div>

            {profile.documents.length === 0 ? (
              <p className="text-sm text-slate-400">Aún no has subido documentos.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {profile.documents.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-col gap-2 rounded-lg bg-ink-900/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200">
                        {DOCUMENT_TYPE_LABEL[d.type] ?? d.type.replace(/_/g, ' ')}
                      </p>
                      <p className="truncate text-xs text-slate-500">{d.fileName}</p>
                      <p className="text-xs text-slate-600">{fmtDateTime(d.uploadedAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={resolveUploadUrl(d.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost px-2 py-1 text-xs"
                      >
                        Ver
                      </a>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          d.status === 'VALIDADO'
                            ? 'bg-ok/20 text-ok'
                            : d.status === 'RECHAZADO'
                              ? 'bg-bear/20 text-bear'
                              : 'bg-amber-500/20 text-amber-200'
                        }`}
                      >
                        {d.status === 'VALIDADO'
                          ? 'Validado'
                          : d.status === 'RECHAZADO'
                            ? 'Rechazado'
                            : 'En revisión'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-white">{value || '—'}</dd>
    </div>
  );
}
