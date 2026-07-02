import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useClientAuth } from '../auth/ClientAuthContext';
import { Card } from '../components/common/Card';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import {
  DocumentCameraCapture,
  type DocumentCaptureSide,
} from '../components/profile/DocumentCameraCapture';
import { IdentityDocumentPreview } from '../components/profile/IdentityDocumentPreview';
import {
  DOCUMENT_SIDE_LABEL,
  DOCUMENT_TYPE_LABEL,
  fmtDate,
  fmtDateTime,
  fmtPhone,
  IDENTITY_DOCUMENT_TYPES,
  KYC_STATUS_LABEL,
} from '../lib/format';
import type { ClientDocument, ClientProfileData } from '../types';

function mergeUploadedDocument(
  prev: ClientProfileData,
  uploaded: ClientDocument,
): ClientProfileData {
  const withoutSame =
    uploaded.type === 'PASAPORTE'
      ? prev.documents.filter(
          (d) => !IDENTITY_DOCUMENT_TYPES.includes(d.type as (typeof IDENTITY_DOCUMENT_TYPES)[number]),
        )
      : prev.documents.filter(
          (d) =>
            !(d.type === uploaded.type && (d.side ?? 'ANVERSO') === (uploaded.side ?? 'ANVERSO')),
        );
  return { ...prev, documents: [...withoutSame, uploaded] };
}

function pickIdentityDocs(documents: ClientDocument[]) {
  const identity = documents.filter((d) =>
    IDENTITY_DOCUMENT_TYPES.includes(d.type as (typeof IDENTITY_DOCUMENT_TYPES)[number]),
  );
  const passport = identity.find((d) => d.type === 'PASAPORTE');
  const ineAnverso = identity.find(
    (d) => d.type === 'INE' && (!d.side || d.side === 'ANVERSO'),
  );
  const ineReverso = identity.find((d) => d.type === 'INE' && d.side === 'REVERSO');
  return { passport, ineAnverso, ineReverso };
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

  const [docType, setDocType] = useState<'INE' | 'PASAPORTE'>('INE');
  const [docBusy, setDocBusy] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [captureSide, setCaptureSide] = useState<DocumentCaptureSide>('ANVERSO');
  const [pendingAnverso, setPendingAnverso] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);

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

  async function uploadCapturedDocument(
    type: 'INE' | 'PASAPORTE',
    side: DocumentCaptureSide,
    base64: string,
    mimeType: string,
  ) {
    if (!client?.id) return;
    const res = await api.uploadDocument(client.id, {
      type,
      side,
      fileName: `${type.toLowerCase()}-${side.toLowerCase()}.jpg`,
      mimeType,
      data: base64,
    });
    setProfile((prev) => (prev ? mergeUploadedDocument(prev, res.document) : prev));
  }

  function startDocumentScan() {
    setDocError(null);
    setFeedback(null);
    setPendingAnverso(null);
    setCaptureSide('ANVERSO');
    setCameraOpen(true);
  }

  async function onDocumentCaptured(base64: string, mimeType: string) {
    if (!client?.id) return;

    if (docType === 'PASAPORTE') {
      setDocBusy(true);
      setDocError(null);
      setCameraOpen(false);
      try {
        await uploadCapturedDocument('PASAPORTE', 'ANVERSO', base64, mimeType);
        setFeedback('Pasaporte guardado.');
        await refreshSession();
      } catch (e) {
        setDocError(e instanceof Error ? e.message : 'Error al guardar el pasaporte.');
      } finally {
        setDocBusy(false);
      }
      return;
    }

    if (captureSide === 'ANVERSO') {
      setPendingAnverso({ base64, mimeType });
      setCaptureSide('REVERSO');
      setFeedback('Frente capturado. Ahora fotografía el reverso de tu INE.');
      return;
    }

    if (!pendingAnverso) {
      setDocError('Falta la foto del frente. Vuelve a iniciar el escaneo.');
      return;
    }

    setDocBusy(true);
    setDocError(null);
    setCameraOpen(false);
    try {
      await uploadCapturedDocument('INE', 'ANVERSO', pendingAnverso.base64, pendingAnverso.mimeType);
      await uploadCapturedDocument('INE', 'REVERSO', base64, mimeType);
      setPendingAnverso(null);
      setCaptureSide('ANVERSO');
      setFeedback('INE guardada (frente y reverso).');
      await refreshSession();
    } catch (e) {
      setDocError(e instanceof Error ? e.message : 'Error al guardar la INE.');
    } finally {
      setDocBusy(false);
    }
  }

  if (!client) return null;

  const { passport, ineAnverso, ineReverso } = pickIdentityDocs(profile?.documents ?? []);
  const hasIne = Boolean(ineAnverso && ineReverso);
  const hasPassport = Boolean(passport);

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
              Solo INE o pasaporte. La INE requiere frente y reverso con la cámara. Al escanear de
              nuevo, reemplazas el documento anterior.
            </p>

            {hasIne && ineAnverso && ineReverso && (
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <IdentityDocumentPreview
                  doc={ineAnverso}
                  label={`${DOCUMENT_TYPE_LABEL.INE} — ${DOCUMENT_SIDE_LABEL.ANVERSO}`}
                  subtitle={fmtDateTime(ineAnverso.uploadedAt)}
                />
                <IdentityDocumentPreview
                  doc={ineReverso}
                  label={`${DOCUMENT_TYPE_LABEL.INE} — ${DOCUMENT_SIDE_LABEL.REVERSO}`}
                  subtitle={fmtDateTime(ineReverso.uploadedAt)}
                />
              </div>
            )}

            {hasPassport && passport && (
              <div className="mb-4">
                <IdentityDocumentPreview
                  doc={passport}
                  label={DOCUMENT_TYPE_LABEL.PASAPORTE}
                  subtitle={fmtDateTime(passport.uploadedAt)}
                />
              </div>
            )}

            <div className="space-y-3 rounded-lg border border-ink-600 bg-ink-900/40 p-3">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Tipo de documento</span>
                <select
                  className="input"
                  value={docType}
                  disabled={docBusy || cameraOpen}
                  onChange={(e) => setDocType(e.target.value as 'INE' | 'PASAPORTE')}
                >
                  {IDENTITY_DOCUMENT_TYPES.map((k) => (
                    <option key={k} value={k}>
                      {DOCUMENT_TYPE_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="btn-primary w-full"
                disabled={docBusy || cameraOpen}
                onClick={startDocumentScan}
              >
                {docType === 'INE'
                  ? 'Escanear INE (frente y reverso)'
                  : 'Escanear pasaporte'}
              </button>

              {docBusy && <p className="text-sm text-brand-300">Guardando documento…</p>}
              {docError && (
                <p className="rounded-lg bg-bear/15 px-3 py-2 text-xs text-bear">{docError}</p>
              )}
            </div>

            {!hasIne && !hasPassport && !docBusy && (
              <p className="mt-3 text-sm text-slate-400">
                Aún no has escaneado tu documento de identidad.
              </p>
            )}
          </Card>

          <DocumentCameraCapture
            key={`${docType}-${captureSide}`}
            open={cameraOpen}
            kind={docType === 'PASAPORTE' ? 'passport' : 'ine'}
            side={docType === 'INE' ? captureSide : 'ANVERSO'}
            onCapture={(base64, mimeType) => void onDocumentCaptured(base64, mimeType)}
            onClose={() => {
              setCameraOpen(false);
              setPendingAnverso(null);
              setCaptureSide('ANVERSO');
            }}
          />
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
