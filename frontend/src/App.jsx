import { useEffect, useState } from 'react'
import './App.css'
import { FORM_INICIAL } from './constants'
import ProjectTable from './components/ProjectTable'
import ProjectFormModal from './components/ProjectFormModal'
import DeleteProjectModal from './components/DeleteProjectModal'
import StatesChart from './components/StatesChart'
import AnalysisPanel from './components/AnalysisPanel'
import { formatearFechaParaInput, formatearFechaParaMostrar } from './utils/formatters'
import logo from './assets/logo.png'
import { useProjects } from './hooks/useProjects'
import { useAnalysis } from './hooks/useAnalysis'
import { useAlert } from './hooks/useAlert'

function App() {
  const [formulario, setFormulario] = useState(FORM_INICIAL)
  const [proyectoEditando, setProyectoEditando] = useState(null)
  const [mostrarModalFormulario, setMostrarModalFormulario] = useState(false)
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [proyectoPorEliminar, setProyectoPorEliminar] = useState(null)

  const { alerta, mostrarAlerta, limpiarAlerta, tipoAlerta } = useAlert()

  const {
    proyectos,
    cargandoProyectos,
    datosGrafico,
    estadosDisponibles,
    refrescarDatos,
    guardarProyecto,
    eliminarProyecto,
  } = useProjects({
    onError: (mensaje) => mostrarAlerta(mensaje, 'error'),
  })

  const { analisis, cargandoAnalisis, generarAnalisis } = useAnalysis()

  useEffect(() => {
    refrescarDatos()
  }, [refrescarDatos])

  useEffect(() => {
    if (!formulario.estado && estadosDisponibles.length) {
      setFormulario((prev) => ({ ...prev, estado: estadosDisponibles[0] }))
    }
  }, [estadosDisponibles, formulario.estado])

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

  const generarResumen = async ({ mostrarCarga = true, notificar = true } = {}) => {
    try {
      await generarAnalisis({ mostrarCarga })
      if (notificar) mostrarAlerta('Resumen generado exitosamente.')
    } catch (error) {
      console.error(error)
      mostrarAlerta('No fue posible generar el resumen.', 'error')
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

    try {
      await guardarProyecto({ datos: payload, id: proyectoEditando?.id })
      mostrarAlerta(esEdicion ? 'Proyecto actualizado.' : 'Proyecto creado.')
      cerrarModalFormulario()
      await Promise.all([
        refrescarDatos(),
        analisis ? generarResumen({ mostrarCarga: false, notificar: false }) : Promise.resolve(),
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
      await eliminarProyecto(proyectoPorEliminar.id)
      mostrarAlerta('Proyecto eliminado.')
      if (proyectoEditando?.id === proyectoPorEliminar.id) restablecerFormulario()
      cerrarModalEliminar()
      await Promise.all([
        refrescarDatos(),
        analisis ? generarResumen({ mostrarCarga: false, notificar: false }) : Promise.resolve(),
      ])
    } catch (error) {
      console.error(error)
      mostrarAlerta('No fue posible eliminar el proyecto.', 'error')
      cerrarModalEliminar()
    }
  }

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
              onClick={limpiarAlerta}
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
                <p className="text-muted mb-4">
                  Visualiza el total de proyectos por estado.
                </p>
                <StatesChart datos={datosGrafico} />
              </div>
            </section>
          </div>

          <div className="col-12 col-lg-6">
            <AnalysisPanel
              analisis={analisis}
              cargando={cargandoAnalisis}
              onGenerar={() => generarResumen()}
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
