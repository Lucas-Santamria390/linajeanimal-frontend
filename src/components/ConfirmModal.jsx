import { useEffect } from 'react'

/**
 * Modal de confirmacion que bloquea la interaccion externa hasta resolver la accion.
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Indica si el modal esta visible.
 * @param {string} props.title - Titulo del modal.
 * @param {string} props.message - Mensaje de confirmacion.
 * @param {() => void} props.onConfirm - Callback de confirmacion.
 * @param {() => void} props.onCancel - Callback de cancelacion.
 * @param {boolean} [props.loading=false] - Indica si la accion esta en curso.
 * @param {string} [props.confirmText='Confirmar'] - Texto del boton de confirmacion.
 * @param {string} [props.cancelText='Cancelar'] - Texto del boton de cancelacion.
 * @returns {JSX.Element|null}
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) {
  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, loading, onCancel])

  if (!isOpen) return null

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-text/60 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!loading) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        className="w-full max-w-md rounded-2xl bg-neutral-card p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-modal-title" className="text-lg font-semibold text-neutral-text">
          {title}
        </h2>
        <p id="confirm-modal-message" className="mt-2 text-sm leading-6 text-neutral-muted">
          {message}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-text transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-400"
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
