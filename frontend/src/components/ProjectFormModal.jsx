import { useEffect, useRef } from 'react'
import Modal from 'bootstrap/js/dist/modal.js'

function ProjectFormModal({
  abierto,
  titulo,
  formulario,
  errores = {},
  estados,
  onChange,
  onSubmit,
  onClose,
  editando,
}) {
  const modalRef = useRef(null)
  const modalInstanceRef = useRef(null)
  const onCloseRef = useRef(onClose)

  const buildDescribedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined

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

    if (abierto) instancia.show()
    else instancia.hide()
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
              {/* Nombre del proyecto */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold" htmlFor="project-name">
                  Nombre del proyecto <span className="form-required" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  id="project-name"
                  className={`form-control${errores.nombre ? ' is-invalid' : ''}`}
                  value={formulario.nombre}
                  onChange={(event) => onChange('nombre', event.target.value)}
                  placeholder="Ej. Plataforma de analítica"
                  autoComplete="off"
                  maxLength={80}
                  aria-invalid={Boolean(errores.nombre)}
                  aria-describedby={buildDescribedBy(
                    'project-name-help',
                    errores.nombre ? 'project-name-error' : undefined,
                  )}
                  required
                />
                {errores.nombre ? (
                  <div id="project-name-error" className="invalid-feedback">
                    {errores.nombre}
                  </div>
                ) : (
                  <div id="project-name-help" className="form-text">
                    Utiliza un nombre descriptivo de entre 3 y 80 caracteres.
                  </div>
                )}
              </div>

              {/* Estado */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold" htmlFor="project-status">
                  Estado <span className="form-required" aria-hidden="true">*</span>
                </label>
                <select
                  id="project-status"
                  className={`form-select${errores.estado ? ' is-invalid' : ''}`}
                  value={formulario.estado}
                  onChange={(event) => onChange('estado', event.target.value)}
                  aria-invalid={Boolean(errores.estado)}
                  aria-describedby={
                    errores.estado ? 'project-status-error' : 'project-status-help'
                  }
                  required
                >
                  {estados.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
                {errores.estado ? (
                  <div id="project-status-error" className="invalid-feedback">
                    {errores.estado}
                  </div>
                ) : (
                  <div id="project-status-help" className="form-text">
                    Selecciona el estado actual del proyecto.
                  </div>
                )}
              </div>

              {/* Fecha de inicio */}
              <div className="col-12 col-md-6 col-lg-6">
                <label className="form-label fw-semibold" htmlFor="project-start-date">
                  Fecha de inicio <span className="form-required" aria-hidden="true">*</span>
                </label>
                <input
                  type="date"
                  id="project-start-date"
                  className={`form-control${errores.fechaInicio ? ' is-invalid' : ''}`}
                  value={formulario.fechaInicio}
                  onChange={(event) => onChange('fechaInicio', event.target.value)}
                  aria-invalid={Boolean(errores.fechaInicio)}
                  aria-describedby={buildDescribedBy(
                    'project-start-date-help',
                    errores.fechaInicio ? 'project-start-date-error' : undefined,
                  )}
                  required
                />
                {errores.fechaInicio ? (
                  <div id="project-start-date-error" className="invalid-feedback">
                    {errores.fechaInicio}
                  </div>
                ) : (
                  <div id="project-start-date-help" className="form-text">
                    Indica cuándo comenzó proyecto.
                  </div>
                )}
              </div>

              {/* Fecha de finalización */}
              <div className="col-12 col-md-6 col-lg-6">
                <label className="form-label fw-semibold" htmlFor="project-end-date">
                  Fecha de finalización <span className="form-required" aria-hidden="true">*</span>
                </label>
                <input
                  type="date"
                  id="project-end-date"
                  className={`form-control${errores.fechaFin ? ' is-invalid' : ''}`}
                  value={formulario.fechaFin}
                  onChange={(event) => onChange('fechaFin', event.target.value)}
                  min={formulario.fechaInicio || undefined}
                  aria-invalid={Boolean(errores.fechaFin)}
                  aria-describedby={buildDescribedBy(
                    'project-end-date-help',
                    errores.fechaFin ? 'project-end-date-error' : undefined,
                  )}
                  required
                />
                {errores.fechaFin ? (
                  <div id="project-end-date-error" className="invalid-feedback">
                    {errores.fechaFin}
                  </div>
                ) : (
                  <div id="project-end-date-help" className="form-text">
                    Debe ser igual o posterior a
                    la fecha de inicio.
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="col-12">
                <label className="form-label fw-semibold" htmlFor="project-description">
                  Descripción <span className="form-required" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="project-description"
                  className={`form-control${errores.descripcion ? ' is-invalid' : ''}`}
                  value={formulario.descripcion}
                  onChange={(event) => onChange('descripcion', event.target.value)}
                  placeholder="Describe el objetivo, alcance y entregables del proyecto."
                  rows={4}
                  minLength={10}
                  maxLength={500}
                  aria-invalid={Boolean(errores.descripcion)}
                  aria-describedby={buildDescribedBy(
                    'project-description-help',
                    errores.descripcion ? 'project-description-error' : undefined,
                  )}
                  required
                />
                {errores.descripcion ? (
                  <div id="project-description-error" className="invalid-feedback">
                    {errores.descripcion}
                  </div>
                ) : (
                  <div id="project-description-help" className="form-text">
                    Resume los objetivos y entregables en al menos 10 caracteres (máx. 500).
                  </div>
                )}
              </div>

              {/* Acciones */}
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
