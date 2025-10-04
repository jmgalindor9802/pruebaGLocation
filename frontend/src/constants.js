export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const ESTADOS_SUGERIDOS = ['En progreso', 'Finalizado', 'Pendiente', 'En espera']

export const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  estado: ESTADOS_SUGERIDOS[0],
  fechaInicio: '',
  fechaFin: '',
}