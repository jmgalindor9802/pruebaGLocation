import { useEffect, useRef } from 'react'
import Modal from 'bootstrap/js/dist/modal.js'

function ProjectFormModal({
  abierto,
  titulo,
  formulario,
  estados,
  onChange,
  onSubmit,
  onClose,
  editando,
}) {
  const modalRef = useRef(null)
  const modalInstanceRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!modalRef.current) return undefined

    const modalElement = modalRef.current
    const instancia = new Modal(modalElement, { backdrop: 'static' })
    modalInstanceRef.current = instancia

    const handleHidden = () => {
      onCloseRef.current?.()
    }

    modalElement.addEventListener('hidden.bs.modal', handleHidden)

    return () => {
      modalElement.removeEventListener('hidden.bs.modal', handleHidden)
      modalInstanceRef.current = null
      instancia.dispose()
    }
  }, [])

  useEffect(() => {
    const instancia = modalInstanceRef.current
    if (!instancia) return

    if (abierto) {
      instancia.show()
    } else {
      instancia.hide()
    }
  }, [abierto])

  const handleCloseClick = () => {
    modalInstanceRef.current?.hide()
    onCloseRef.current?.()
  }

  return (
    <div ref={modalRef} className="modal fade" tabIndex={-1} aria-hidden={!abierto}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h5 mb-0">{titulo}</h2>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={handleCloseClick}
            ></button>
          </div>

          <div className="modal-body">
            <form onSubmit={onSubmit} className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Nombre del proyecto *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formulario.nombre}
                  onChange={(event) => onChange('nombre', event.target.value)}
                  placeholder="Ej. Plataforma de analítica"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Estado *</label>
                <select
                  className="form-select"
                  value={formulario.estado}
                  onChange={(event) => onChange('estado', event.target.value)}
                  required
                >
                  {estados.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">Fecha de inicio</label>
                <input
                  type="date"
                  className="form-control"
                  value={formulario.fechaInicio}
                  onChange={(event) => onChange('fechaInicio', event.target.value)}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">Fecha de finalización</label>
                <input
                  type="date"
                  className="form-control"
                  value={formulario.fechaFin}
                  onChange={(event) => onChange('fechaFin', event.target.value)}
                  min={formulario.fechaInicio || undefined}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Descripción *</label>
                <textarea
                  className="form-control"
                  value={formulario.descripcion}
                  onChange={(event) => onChange('descripcion', event.target.value)}
                  placeholder="Describe el objetivo, alcance y entregables del proyecto."
                  rows={4}
                  required
                />
              </div>

              <div className="col-12 d-flex flex-wrap gap-3 form-actions">
                <button type="submit" className="btn btn-primary">
                  {editando ? 'Guardar cambios' : 'Crear proyecto'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCloseClick}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectFormModal
