export const obtenerProyectos = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.proyectos)) return payload.proyectos
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

export const obtenerGrafico = (payload) => {
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

export const obtenerAnalisis = (payload) => {
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