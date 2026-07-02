import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useClientAuth } from '../auth/ClientAuthContext';
import { Card } from '../components/common/Card';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { IdentityDocumentPreview } from '../components/profile/IdentityDocumentPreview';
import {
  DOCUMENT_TYPE_LABEL,
  fmtDate,
  fmtDateTime,
  fmtPhone,
  IDENTITY_DOCUMENT_TYPES,
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

  async function onDocumentFileSelected(file: File | null) {
    if (!file || !client?.id) {
      return;
    }
    const ok =
      /\.(pdf|png|jpe?g|webp|gif)$/i.test(file.name) ||
      /^(application\/pdf|image\/(png|jpeg|jpg|webp|gif))$/i.test(file.type);
    if (!ok) {
      setDocError('Formato no permitido. Usa PDF, PNG, JPG o WEBP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocError('El archivo no debe superar 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setDocBusy(true);
    setDocError(null);
    setFeedback(null);
    try {
      const data = await readFileAsBase64(file);
      const res = await api.uploadDocument(client.id, {
        type: docType,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        data,
      });
      setProfile((prev) =>
        prev ? { ...prev, documents: [res.document, ...prev.documents] } : prev,
      );
      setFeedback('Documento guardado.');
      await refreshSession();
    } catch (e) {
      setDocError(e instanceof Error ? e.message : 'Error al guardar el documento.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setDocBusy(false);
    }
  }

  if (!client) return null;

  const identityDocuments = (profile?.documents ?? []).filter((d) =>
    IDENTITY_DOCUMENT_TYPES.includes(d.type as (typeof IDENTITY_DOCUMENT_TYPES)[number]),
  );

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
              Elige el tipo y selecciona tu archivo. Se guarda al instante y aparece arriba.
            </p>

            {identityDocuments.length > 0 && (
              <div className="mb-4 space-y-3">
                {identityDocuments.map((d) => (
                  <IdentityDocumentPreview
                    key={d.id}
                    doc={d}
                    label={DOCUMENT_TYPE_LABEL[d.type] ?? d.type}
                    subtitle={fmtDateTime(d.uploadedAt)}
                  />
                ))}
              </div>
            )}

            <div className="space-y-3 rounded-lg border border-ink-600 bg-ink-900/40 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-300">Tipo de documento</span>
                  <select
                    className="input"
                    value={docType}
                    disabled={docBusy}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    {IDENTITY_DOCUMENT_TYPES.map((k) => (
                      <option key={k} value={k}>
                        {DOCUMENT_TYPE_LABEL[k]}
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
                    disabled={docBusy}
                    className="input cursor-pointer file:mr-2 file:rounded file:border-0 file:bg-brand-600 file:px-2 file:py-1 file:text-xs file:text-white disabled:opacity-60"
                    onChange={(e) => void onDocumentFileSelected(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              {docBusy && <p className="text-sm text-brand-300">Guardando documento…</p>}
              {docError && (
                <p className="rounded-lg bg-bear/15 px-3 py-2 text-xs text-bear">{docError}</p>
              )}
            </div>

            {identityDocuments.length === 0 && !docBusy && (
              <p className="mt-3 text-sm text-slate-400">Aún no has subido documentos.</p>
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
