import { useCallback, useMemo, useState } from 'react'
import { API_URL, ESTADOS_SUGERIDOS } from '../constants'
import { obtenerGrafico, obtenerProyectos } from '../utils/dataTransformers'

export function useProjects({ onError } = {}) {
  const [proyectos, setProyectos] = useState([])
  const [cargandoProyectos, setCargandoProyectos] = useState(true)
  const [datosGrafico, setDatosGrafico] = useState([])

  const estadosDisponibles = useMemo(() => {
    const conjunto = new Set(ESTADOS_SUGERIDOS)
    proyectos.forEach((proyecto) => {
      if (proyecto.estado) conjunto.add(proyecto.estado)
    })
    return Array.from(conjunto)
  }, [proyectos])

  const notificarError = useCallback(
    (mensaje) => {
      if (onError) onError(mensaje)
    },
    [onError],
  )

  const cargarProyectos = useCallback(async () => {
    setCargandoProyectos(true)
    try {
      const respuesta = await fetch(`${API_URL}/proyectos`)
      if (!respuesta.ok) throw new Error('No fue posible cargar los proyectos')
      const payload = await respuesta.json()
      setProyectos(obtenerProyectos(payload))
    } catch (error) {
      console.error(error)
      notificarError('No fue posible obtener los proyectos. Verifica la API.')
      setProyectos([])
    } finally {
      setCargandoProyectos(false)
    }
  }, [notificarError])

  const cargarGrafico = useCallback(async () => {
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

  const refrescarDatos = useCallback(async () => {
    await Promise.all([cargarProyectos(), cargarGrafico()])
  }, [cargarProyectos, cargarGrafico])

  const guardarProyecto = useCallback(async ({ datos, id }) => {
    const esEdicion = Boolean(id)
    const url = esEdicion ? `${API_URL}/proyectos/${id}` : `${API_URL}/proyectos`
    const metodo = esEdicion ? 'PUT' : 'POST'

    const respuesta = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    if (!respuesta.ok) {
      throw new Error((await respuesta.text()) || 'Error en la API')
    }
  }, [])

  const eliminarProyecto = useCallback(async (id) => {
    const respuesta = await fetch(`${API_URL}/proyectos/${id}`, {
      method: 'DELETE',
    })

    if (!respuesta.ok) {
      throw new Error('Error al eliminar el proyecto')
    }
  }, [])

  return {
    proyectos,
    cargandoProyectos,
    datosGrafico,
    estadosDisponibles,
    refrescarDatos,
    guardarProyecto,
    eliminarProyecto,
  }
}

export default useProjects