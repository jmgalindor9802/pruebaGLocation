import { useCallback, useState } from 'react'
import { API_URL } from '../constants'
import { obtenerAnalisis } from '../utils/dataTransformers'

export function useAnalysis() {
  const [analisis, setAnalisis] = useState('')
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false)

  const generarAnalisis = useCallback(
    async ({ mostrarCarga = true } = {}) => {
      if (mostrarCarga) setCargandoAnalisis(true)

      try {
        const respuesta = await fetch(`${API_URL}/analisis`)
        if (!respuesta.ok) {
          throw new Error('No fue posible obtener el análisis con IA')
        }
        const payload = await respuesta.json()
        const resumen = obtenerAnalisis(payload)
        setAnalisis(resumen)
        return resumen
      } catch (error) {
        setAnalisis('')
        throw error
      } finally {
        if (mostrarCarga) setCargandoAnalisis(false)
      }
    },
    [],
  )

  return { analisis, cargandoAnalisis, generarAnalisis }
}

export default useAnalysis