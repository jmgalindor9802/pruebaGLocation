const CLASES_ESTADO = {
  'En progreso': 'text-bg-primary',
  Finalizado: 'text-bg-success',
  Pendiente: 'text-bg-warning text-dark',
  'En espera': 'text-bg-info',
}

function ProjectTable({
  proyectos,
  cargando,
  onCrear,
  onEditar,
  onEliminar,
  formatearFecha,
}) {
  return (
    <section className="card shadow-sm border-0 mb-4">
      <div className="card-body p-4 p-md-5">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center gap-3 mb-4">
          <div className="text-center text-lg-start">
            <h2 className="h4 mb-1">Proyectos registrados</h2>
            <p className="text-muted mb-0">
              Revisa los proyectos registrados en la API, ordénalos y gestiona sus estados.
            </p>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-lg-auto">
            <button type="button" className="btn btn-primary w-100" onClick={onCrear}>
              Nuevo proyecto
            </button>       
          </div>
        </div>

        {cargando ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : proyectos.length === 0 ? (
          <div className="alert alert-secondary mb-0">Aún no hay proyectos registrados.</div>
        ) : (
          <div className="table-responsive responsive-table">
            <table className="table table-hover align-middle mb-0">
                  <colgroup>
                <col className="w-25" />
                <col style={{ width: '12rem' }} />
                <col style={{ width: '10rem' }} />
                <col style={{ width: '10rem' }} />
                <col className="w-25" />
                <col style={{ width: '8rem' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Descripción</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((proyecto) => (
                  <tr key={proyecto.id ?? proyecto.nombre}>
                    <td className="fw-semibold text-secondary" data-label="Nombre">
                       <span className="d-inline-block text-truncate" style={{ maxWidth: '14rem' }}>
                        {proyecto.nombre}
                      </span>
                    </td>
                    <td data-label="Estado">
                       <span
                        className={`badge rounded-pill ${
                          CLASES_ESTADO[proyecto.estado] ?? 'text-bg-secondary'
                        }`}
                      >
                        {proyecto.estado ?? 'Sin estado'}
                      </span>
                    </td>
                    <td data-label="Inicio">
                      <span className="d-inline-block text-truncate" style={{ maxWidth: '9rem' }}>
                        {formatearFecha(proyecto.fechaInicio)}
                      </span>
                    </td>
                    <td data-label="Fin">
                      <span className="d-inline-block text-truncate" style={{ maxWidth: '9rem' }}>
                        {formatearFecha(proyecto.fechaFin)}
                      </span>
                    </td>
                    <td className="text-muted small" data-label="Descripción">
                      <div className="text-wrap text-break" style={{ maxWidth: '16rem' }}>
                        {proyecto.descripcion}
                      </div>
                    </td>
                    <td className="text-end" data-label="Acciones">
                      <div className="d-flex justify-content-end gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => onEditar(proyecto)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => onEliminar(proyecto)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProjectTable
