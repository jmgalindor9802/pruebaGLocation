import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { API_URL, ESTADOS_SUGERIDOS, FORM_INICIAL } from './constants'
import ProjectTable from './components/ProjectTable'
import ProjectFormModal from './components/ProjectFormModal'
import DeleteProjectModal from './components/DeleteProjectModal'
import StatesChart from './components/StatesChart'
import AnalysisPanel from './components/AnalysisPanel'
import { obtenerAnalisis, obtenerGrafico, obtenerProyectos } from './utils/dataTransformers'
import { formatearFechaParaInput, formatearFechaParaMostrar } from './utils/formatters'
import logo from './assets/logo.png'

function App() {
  const [proyectos, setProyectos] = useState([])
  const [formulario, setFormulario] = useState(FORM_INICIAL)
  const [proyectoEditando, setProyectoEditando] = useState(null)
  const [cargandoProyectos, setCargandoProyectos] = useState(true)
  const [analisis, setAnalisis] = useState('')
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false)
  const [datosGrafico, setDatosGrafico] = useState([])
  const [alerta, setAlerta] = useState(null)
  const [mostrarModalFormulario, setMostrarModalFormulario] = useState(false)
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [proyectoPorEliminar, setProyectoPorEliminar] = useState(null)

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
    const temporizador = alerta ? setTimeout(() => setAlerta(null), 4000) : null
    return () => temporizador && clearTimeout(temporizador)
  }, [alerta])

  const mostrarAlerta = useCallback((mensaje, tipo = 'exito') => {
    setAlerta({ mensaje, tipo })
  }, [])

  const obtenerListado = useCallback(async () => {
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
  }, [mostrarAlerta])

  const obtenerGraficoEstados = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/proyectos/graficos`)
      if (!respuesta.ok) throw new Error('No fue posible cargar el gráfico')
      const payload = await respuesta.json()
      setDatosGrafico(obtenerGrafico(payload))
    } catch (error) {
      console.error(error)
      setDatosGrafico([])
    }
  }, [])

  const refrescarInformacion = useCallback(async () => {
    await Promise.all([obtenerListado(), obtenerGraficoEstados()])
  }, [obtenerListado, obtenerGraficoEstados])

  useEffect(() => {
    refrescarInformacion()
  }, [refrescarInformacion])

  const manejarCambio = (campo, valor) =>
    setFormulario((prev) => ({ ...prev, [campo]: valor }))

  const restablecerFormulario = () => {
    setFormulario({ ...FORM_INICIAL, estado: estadosDisponibles[0] ?? FORM_INICIAL.estado })
    setProyectoEditando(null)
  }

  const abrirModalCrear = () => {
    restablecerFormulario()
    setMostrarModalFormulario(true)
  }

  const cerrarModalFormulario = () => {
    setMostrarModalFormulario(false)
    restablecerFormulario()
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

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
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
      if (!respuesta.ok) throw new Error((await respuesta.text()) || 'Error en la API')

      mostrarAlerta(esEdicion ? 'Proyecto actualizado.' : 'Proyecto creado.')
      cerrarModalFormulario()
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
    setMostrarModalFormulario(true)
  }

  const abrirModalEliminar = (proyecto) => {
    setProyectoPorEliminar(proyecto)
    setMostrarModalEliminar(true)
  }

  const cerrarModalEliminar = () => {
    setMostrarModalEliminar(false)
    setProyectoPorEliminar(null)
  }

  const confirmarEliminacion = async () => {
    if (!proyectoPorEliminar) return
    try {
      const respuesta = await fetch(`${API_URL}/proyectos/${proyectoPorEliminar.id}`, {
        method: 'DELETE',
      })
      if (!respuesta.ok) throw new Error('Error al eliminar')
      mostrarAlerta('Proyecto eliminado.')
      if (proyectoEditando?.id === proyectoPorEliminar.id) restablecerFormulario()
      cerrarModalEliminar()
      await Promise.all([
        obtenerListado(),
        obtenerGraficoEstados(),
        analisis ? analizarProyectos(false) : Promise.resolve(),
      ])
    } catch (error) {
      console.error(error)
      mostrarAlerta('No fue posible eliminar el proyecto.', 'error')
      cerrarModalEliminar()
    }
  }

  const tipoAlerta = alerta?.tipo === 'error' ? 'danger' : 'success'

  return (
    <div className="bg-light min-vh-100">
      <main className="app-container container py-4 py-md-5">
    <header className="app-hero card border-0 shadow-sm mb-4 mb-md-5">
  <div className="card-body p-4 p-md-5 d-flex flex-column gap-3 gap-md-4">
    {/* LOGO + TITULOS */}
    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 gap-md-4">
      <div className="app-logo-wrapper flex-shrink-0 mx-auto mx-md-0">
        <img src={logo} alt="Logotipo de GLocation" className="app-logo" />
      </div>

      <div className="text-center text-md-start">
        <span className="app-badge d-inline-block mb-2">
          Panel de control
        </span>
        <h1 className="app-title fw-bold mb-2">
          Gestor de proyectos
        </h1>
        <p className="app-subtitle fs-5 mb-0">
          Administra los proyectos registrados, genera resúmenes automáticos con IA y
          visualiza su distribución por estado.
        </p>
      </div>
    </div>
  </div>
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

        <ProjectTable
          proyectos={proyectos}
          cargando={cargandoProyectos}
          onCrear={abrirModalCrear}
          onEditar={manejarEdicion}
          onEliminar={abrirModalEliminar}
          formatearFecha={formatearFechaParaMostrar}
        />

        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <section className="card shadow-sm border-0 h-100">
              <div className="card-body p-4 p-md-5">
                <h2 className="h4 mb-1">Distribución por estado</h2>
                <p className="text-muted mb-4">Visualiza el total de proyectos por estado.</p>
                <StatesChart datos={datosGrafico} />
              </div>
            </section>
          </div>

          <div className="col-12 col-lg-6">
            <AnalysisPanel
              analisis={analisis}
              cargando={cargandoAnalisis}
              onGenerar={() => analizarProyectos()}
            />
          </div>
        </div>
      </main>

      <ProjectFormModal
        abierto={mostrarModalFormulario}
        titulo={proyectoEditando ? 'Editar proyecto' : 'Nuevo proyecto'}
        formulario={formulario}
        estados={estadosDisponibles}
        onChange={manejarCambio}
        onSubmit={manejarEnvio}
        onClose={cerrarModalFormulario}
        editando={Boolean(proyectoEditando)}
      />

      <DeleteProjectModal
        abierto={mostrarModalEliminar}
        proyecto={proyectoPorEliminar}
        onClose={cerrarModalEliminar}
        onConfirmar={confirmarEliminacion}
      />
    </div>
  )
}

export default App
