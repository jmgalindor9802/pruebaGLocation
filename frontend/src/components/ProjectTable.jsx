function ProjectTable({
  proyectos,
  cargando,
  onCrear,
  onRefrescar,
  onEditar,
  onEliminar,
  formatearFecha,
}) {
  return (
    <section className="card shadow-sm border-0 mb-4">
      <div className="card-body p-4 p-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h2 className="h4 mb-1">Proyectos registrados</h2>
            <p className="text-muted mb-0">
              Revisa los proyectos registrados en la API, ordénalos y gestiona sus estados.
            </p>
          </div>
          <div className="d-flex flex-column flex-md-row gap-2">
            <button type="button" className="btn btn-primary" onClick={onCrear}>
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
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
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
                    <td className="fw-semibold text-secondary">{proyecto.nombre}</td>
                    <td>
                      <span className="badge text-bg-info text-wrap">
                        {proyecto.estado ?? 'Sin estado'}
                      </span>
                    </td>
                    <td>{formatearFecha(proyecto.fechaInicio)}</td>
                    <td>{formatearFecha(proyecto.fechaFin)}</td>
                    <td className="table-description text-muted small">{proyecto.descripcion}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
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