import { useEffect, useRef } from 'react'

function DeleteProjectModal({ abierto, proyecto, onClose, onConfirmar }) {
  const modalRef = useRef(null)

  useEffect(() => {
    const { bootstrap } = window
    if (!modalRef.current || !bootstrap?.Modal) return undefined

    const modalElement = modalRef.current
    const instancia = bootstrap.Modal.getOrCreateInstance(modalElement)

    const handleHidden = () => {
      onClose?.()
    }

    modalElement.addEventListener('hidden.bs.modal', handleHidden)

    return () => {
      modalElement.removeEventListener('hidden.bs.modal', handleHidden)
      instancia.dispose()
    }
  }, [onClose])

  useEffect(() => {
    const { bootstrap } = window
    if (!modalRef.current || !bootstrap?.Modal) return

    const instancia = bootstrap.Modal.getOrCreateInstance(modalRef.current)

    if (abierto) {
      instancia.show()
    } else {
      instancia.hide()
    }
  }, [abierto])

  const handleCloseClick = () => {
    const { bootstrap } = window
    if (modalRef.current && bootstrap?.Modal) {
      const instancia = bootstrap.Modal.getOrCreateInstance(modalRef.current)
      instancia.hide()
    }
    onClose?.()
  }

  return (
    <div ref={modalRef} className="modal fade" tabIndex={-1} aria-hidden={!abierto}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h5 mb-0">Confirmar eliminación</h2>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={handleCloseClick}></button>
          </div>
          <div className="modal-body">
            <p className="mb-4">
              ¿Seguro que deseas eliminar el proyecto{' '}
              <span className="fw-semibold">“{proyecto?.nombre}”</span>? Esta acción no se puede deshacer.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={handleCloseClick}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirmar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteProjectModal