function AnalysisPanel({ analisis, cargando, onGenerar }) {
  return (
    <section className="card shadow-sm border-0 h-100">
      <div className="card-body p-4 p-md-5 d-flex flex-column gap-3">
        <div>
          <h2 className="h4 mb-1">Resumen automático</h2>
          <p className="text-muted mb-0">
            Solicita a la API un resumen generado con IA sobre los proyectos registrados.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary align-self-start"
          onClick={onGenerar}
          disabled={cargando}
        >
          {cargando && (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          )}
          {cargando ? 'Generando resumen…' : 'Generar resumen con IA'}
        </button>

        {analisis ? (
          <div className="analysis-content bg-body-tertiary border rounded-3 text-secondary">
            {analisis}
          </div>
        ) : (
          <div className="chart-empty">
            Obtén una visión general automática de tus proyectos con un solo clic.
          </div>
        )}
      </div>
    </section>
  )
}

export default AnalysisPanel