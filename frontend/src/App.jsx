import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const ESTADOS_SUGERIDOS = ['En progreso', 'Finalizado', 'Pendiente', 'En espera']

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  estado: ESTADOS_SUGERIDOS[0],
  fechaInicio: '',
  fechaFin: '',
}

const obtenerProyectos = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.proyectos)) return payload.proyectos
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

const obtenerGrafico = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) {
    return payload
      .map((item, index) => {
        if (typeof item === 'number') {
          return { etiqueta: `Estado ${index + 1}`, valor: item }
        }
        if (typeof item === 'string') {
          return { etiqueta: item, valor: 1 }
        }
        if (item && typeof item === 'object') {
          const etiqueta =
            item.estado ?? item.label ?? item.nombre ?? item.name ?? item.etiqueta
          const rawValor =
            item.cantidad ?? item.valor ?? item.total ?? item.value ?? item.count
          const valor = Number(rawValor)
          if (!etiqueta || Number.isNaN(valor)) return null
          return { etiqueta, valor }
        }
        return null
      })
      .filter(Boolean)
  }
  if (typeof payload === 'object') {
    if (Array.isArray(payload?.data)) return obtenerGrafico(payload.data)
    if (Array.isArray(payload?.estados)) return obtenerGrafico(payload.estados)
    return Object.entries(payload)
      .map(([etiqueta, valor]) => ({ etiqueta, valor: Number(valor) }))
      .filter((item) => item.etiqueta && !Number.isNaN(item.valor))
  }
  return []
}

const obtenerAnalisis = (payload) => {
  if (!payload) return ''
  if (typeof payload === 'string') return payload
  if (Array.isArray(payload)) return payload.filter(Boolean).join('\n\n')
  if (typeof payload === 'object') {
    if (typeof payload.resumen === 'string') return payload.resumen
    if (typeof payload.analisis === 'string') return payload.analisis
    if (Array.isArray(payload.resumenes)) return payload.resumenes.join('\n\n')
    if (Array.isArray(payload.data)) return obtenerAnalisis(payload.data)
    if (typeof payload.message === 'string') return payload.message
  }
  return ''
}

const formatearFechaParaInput = (valor) => {
  if (!valor) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''
  const offset = fecha.getTimezoneOffset() * 60000
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10)
}

const formatearFechaParaMostrar = (valor) => {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(fecha)
}

function GraficoEstados({ datos }) {
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

function App() {
  const [proyectos, setProyectos] = useState([])
  const [formulario, setFormulario] = useState(FORM_INICIAL)
  const [proyectoEditando, setProyectoEditando] = useState(null)
  const [cargandoProyectos, setCargandoProyectos] = useState(true)
  const [analisis, setAnalisis] = useState('')
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false)
  const [datosGrafico, setDatosGrafico] = useState([])
  const [alerta, setAlerta] = useState(null)

  const estadosDisponibles = useMemo(() => {
    const conjunto = new Set(ESTADOS_SUGERIDOS)
    proyectos.forEach((proyecto) => {
      if (proyecto.estado) conjunto.add(proyecto.estado)
    })
    return Array.from(conjunto)
  }, [proyectos])

  useEffect(() => {
    if (!formulario.estado && estadosDisponibles.length) {
      setFormulario((prev) => ({ ...prev, estado: estadosDisponibles[0] }))
    }
  }, [estadosDisponibles, formulario.estado])

  useEffect(() => {
    const temporizador = alerta
      ? setTimeout(() => setAlerta(null), 4000)
      : null
    return () => temporizador && clearTimeout(temporizador)
  }, [alerta])

  useEffect(() => {
    refrescarInformacion()
  }, [])

  const mostrarAlerta = (mensaje, tipo = 'exito') => setAlerta({ mensaje, tipo })

  const refrescarInformacion = async () => {
    await Promise.all([obtenerListado(), obtenerGraficoEstados()])
  }

  const obtenerListado = async () => {
    setCargandoProyectos(true)
    try {
      const respuesta = await fetch(`${API_URL}/proyectos`)
      if (!respuesta.ok) throw new Error('No fue posible cargar los proyectos')
      const payload = await respuesta.json()
      setProyectos(obtenerProyectos(payload))
    } catch (error) {
      console.error(error)
      mostrarAlerta('No fue posible obtener los proyectos. Verifica la API.', 'error')
      setProyectos([])
    } finally {
      setCargandoProyectos(false)
    }
  }

  const obtenerGraficoEstados = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/graficos`)
      if (!respuesta.ok) throw new Error('No fue posible cargar el gráfico')
      const payload = await respuesta.json()
      setDatosGrafico(obtenerGrafico(payload))
    } catch (error) {
      console.error(error)
      setDatosGrafico([])
    }
  }

  const manejarCambio = (campo, valor) => setFormulario((prev) => ({ ...prev, [campo]: valor }))

  const limpiarFormulario = () => {
    setFormulario({ ...FORM_INICIAL, estado: estadosDisponibles[0] ?? FORM_INICIAL.estado })
    setProyectoEditando(null)
  }

  const validarFormulario = () => {
    if (!formulario.nombre.trim()) {
      mostrarAlerta('El nombre del proyecto es obligatorio.', 'error')
      return false
    }
    if (!formulario.descripcion.trim()) {
      mostrarAlerta('La descripción del proyecto es obligatoria.', 'error')
      return false
    }
    if (!formulario.estado) {
      mostrarAlerta('Selecciona un estado para el proyecto.', 'error')
      return false
    }
    return true
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()
    if (!validarFormulario()) return

    const payload = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      estado: formulario.estado,
      fechaInicio: formulario.fechaInicio || null,
      fechaFin: formulario.fechaFin || null,
    }

    const esEdicion = Boolean(proyectoEditando)
    const url = esEdicion
      ? `${API_URL}/proyectos/${proyectoEditando.id ?? proyectoEditando}`
      : `${API_URL}/proyectos`
    const metodo = esEdicion ? 'PUT' : 'POST'

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!respuesta.ok) throw new Error(await respuesta.text() || 'Error en la API')

      mostrarAlerta(esEdicion ? 'Proyecto actualizado.' : 'Proyecto creado.')
      limpiarFormulario()
      await Promise.all([
        obtenerListado(),
        obtenerGraficoEstados(),
        analisis ? analizarProyectos(false) : Promise.resolve(),
      ])
    } catch (error) {
      console.error(error)
      mostrarAlerta('No fue posible guardar el proyecto.', 'error')
    }
  }

  const manejarEdicion = (proyecto) => {
    setProyectoEditando(proyecto)
    setFormulario({
      nombre: proyecto.nombre ?? '',
      descripcion: proyecto.descripcion ?? '',
      estado: proyecto.estado ?? estadosDisponibles[0] ?? FORM_INICIAL.estado,
      fechaInicio: formatearFechaParaInput(proyecto.fechaInicio),
      fechaFin: formatearFechaParaInput(proyecto.fechaFin),
    })
  }

  const manejarEliminacion = async (proyecto) => {
    const confirmar = window.confirm(`¿Eliminar "${proyecto.nombre}"?`)
    if (!confirmar) return

    try {
      const respuesta = await fetch(`${API_URL}/proyectos/${proyecto.id}`, { method: 'DELETE' })
      if (!respuesta.ok) throw new Error('Error al eliminar')
      mostrarAlerta('Proyecto eliminado.')
      if (proyectoEditando?.id === proyecto.id) limpiarFormulario()
      await Promise.all([
        obtenerListado(),
        obtenerGraficoEstados(),
        analisis ? analizarProyectos(false) : Promise.resolve(),
      ])
    } catch (error) {
      console.error(error)
      mostrarAlerta('No fue posible eliminar el proyecto.', 'error')
    }
  }

  const analizarProyectos = async (mostrarCarga = true) => {
    if (mostrarCarga) setCargandoAnalisis(true)
    try {
      const respuesta = await fetch(`${API_URL}/analisis`)
      if (!respuesta.ok) throw new Error('No fue posible obtener el análisis con IA')
      const payload = await respuesta.json()
      setAnalisis(obtenerAnalisis(payload))
      if (mostrarCarga) mostrarAlerta('Resumen generado exitosamente.')
    } catch (error) {
      console.error(error)
      if (mostrarCarga) mostrarAlerta('No fue posible generar el resumen.', 'error')
      setAnalisis('')
    } finally {
      if (mostrarCarga) setCargandoAnalisis(false)
    }
  }

  const hayCambiosEnFormulario = useMemo(() => {
    return (
      formulario.nombre !== FORM_INICIAL.nombre ||
      formulario.descripcion !== FORM_INICIAL.descripcion ||
      formulario.estado !== (estadosDisponibles[0] ?? FORM_INICIAL.estado) ||
      formulario.fechaInicio !== FORM_INICIAL.fechaInicio ||
      formulario.fechaFin !== FORM_INICIAL.fechaFin ||
      Boolean(proyectoEditando)
    )
  }, [formulario, proyectoEditando, estadosDisponibles])

  const tipoAlerta = alerta?.tipo === 'error' ? 'danger' : 'success'

  return (
    <div className="bg-light min-vh-100">
      <main className="app-container container py-4 py-md-5">
        <header className="mb-4 mb-md-5 text-center text-md-start">
          <span className="badge text-bg-primary-subtle text-primary-emphasis mb-2">
            Panel de control
          </span>
          <h1 className="display-6 fw-bold">Gestor de proyectos</h1>
          <p className="text-muted fs-5 mb-0">
            Administra los proyectos registrados en la API, genera resúmenes automáticos con IA y
            visualiza su distribución por estado.
          </p>
        </header>

        {alerta && (
          <div className={`alert alert-${tipoAlerta} alert-dismissible fade show`} role="alert">
            {alerta.mensaje}
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar alerta"
              onClick={() => setAlerta(null)}
            ></button>
          </div>
        )}

        {/* Formulario de registro/edición */}
        <section className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
              <div>
                <h2 className="h4 mb-1">
                  {proyectoEditando ? 'Editar proyecto' : 'Registrar proyecto'}
                </h2>
                <p className="text-muted mb-0">Los campos marcados con * son obligatorios.</p>
              </div>
              {proyectoEditando && (
                <span className="badge text-bg-warning-subtle text-warning-emphasis">
                  Editando proyecto
                </span>
              )}
            </div>

            <form onSubmit={manejarEnvio} className="row g-3 g-md-4">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Nombre del proyecto *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formulario.nombre}
                  onChange={(e) => manejarCambio('nombre', e.target.value)}
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
                  onChange={(e) => manejarCambio('estado', e.target.value)}
                  required
                >
                  {estadosDisponibles.map((estado) => (
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
                  onChange={(e) => manejarCambio('fechaInicio', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">Fecha de finalización</label>
                <input
                  type="date"
                  className="form-control"
                  value={formulario.fechaFin}
                  onChange={(e) => manejarCambio('fechaFin', e.target.value)}
                  min={formulario.fechaInicio || undefined}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Descripción *</label>
                <textarea
                  className="form-control"
                  value={formulario.descripcion}
                  onChange={(e) => manejarCambio('descripcion', e.target.value)}
                  placeholder="Describe el objetivo, alcance y entregables del proyecto."
                  rows={4}
                  required
                />
              </div>

              <div className="col-12 d-flex flex-wrap gap-3 form-actions">
                <button type="submit" className="btn btn-primary">
                  {proyectoEditando ? 'Guardar cambios' : 'Crear proyecto'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={limpiarFormulario}
                  disabled={!hayCambiosEnFormulario}
                >
                  Limpiar formulario
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Listado de proyectos */}
        <section className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
              <div>
                <h2 className="h4 mb-1">Listado de proyectos</h2>
                <p className="text-muted mb-0">
                  Consulta, edita o elimina los proyectos registrados en la base de datos.
                </p>
              </div>
              <button type="button" className="btn btn-outline-primary" onClick={refrescarInformacion}>
                Actualizar datos
              </button>
            </div>

            {cargandoProyectos ? (
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
                        <td>{formatearFechaParaMostrar(proyecto.fechaInicio)}</td>
                        <td>{formatearFechaParaMostrar(proyecto.fechaFin)}</td>
                        <td className="table-description text-muted small">
                          {proyecto.descripcion}
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => manejarEdicion(proyecto)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => manejarEliminacion(proyecto)}
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

        {/* Gráfico y análisis IA */}
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <section className="card shadow-sm border-0 h-100">
              <div className="card-body p-4 p-md-5">
                <h2 className="h4 mb-1">Distribución por estado</h2>
                <p className="text-muted mb-4">Visualiza el total de proyectos por estado.</p>
                <GraficoEstados datos={datosGrafico} />
              </div>
            </section>
          </div>

          <div className="col-12 col-lg-6">
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
                  onClick={() => analizarProyectos()}
                  disabled={cargandoAnalisis}
                >
                  {cargandoAnalisis && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                  )}
                  {cargandoAnalisis ? 'Generando resumen…' : 'Generar resumen con IA'}
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
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
