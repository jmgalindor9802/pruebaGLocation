function StatesChart({ datos }) {
  if (!datos.length) {
    return <div className="chart-empty">Aún no hay información para graficar.</div>
  }

  const valorMaximo = Math.max(...datos.map((item) => item.valor), 0)

  return (
    <div className="chart-progress">
      {datos.map((item) => {
        const porcentaje = valorMaximo ? (item.valor / valorMaximo) * 100 : 0
        const estiloBarra = { width: `${porcentaje}%` }

        if (item.valor && porcentaje < 12) {
          estiloBarra.minWidth = '12%'
        }

        return (
          <div key={item.etiqueta} className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold text-secondary">{item.etiqueta}</span>
              <span className="badge text-bg-primary">{item.valor}</span>
            </div>
            <div
              className="progress mt-2"
              role="progressbar"
              aria-label={`Proyectos en estado ${item.etiqueta}`}
              aria-valuenow={item.valor}
              aria-valuemin={0}
              aria-valuemax={valorMaximo || 1}
            >
              <div className="progress-bar" style={estiloBarra}>
                {porcentaje >= 18 ? `${Math.round(porcentaje)}%` : ''}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatesChart