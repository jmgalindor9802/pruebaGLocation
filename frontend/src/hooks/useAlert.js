import { useCallback, useEffect, useMemo, useState } from 'react'

const TIEMPO_ALERTA = 4000

export function useAlert(timeout = TIEMPO_ALERTA) {
  const [alerta, setAlerta] = useState(null)

  useEffect(() => {
    if (!alerta) return undefined

    const temporizador = setTimeout(() => setAlerta(null), timeout)
    return () => clearTimeout(temporizador)
  }, [alerta, timeout])

  const mostrarAlerta = useCallback((mensaje, tipo = 'exito') => {
    setAlerta({ mensaje, tipo })
  }, [])

  const limpiarAlerta = useCallback(() => setAlerta(null), [])

  const tipoAlerta = useMemo(
    () => (alerta?.tipo === 'error' ? 'danger' : 'success'),
    [alerta],
  )

  return { alerta, mostrarAlerta, limpiarAlerta, tipoAlerta }
}

export default useAlert