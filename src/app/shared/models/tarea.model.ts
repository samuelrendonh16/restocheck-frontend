/**
 * MODELOS DE TAREAS
 * Interfaces para checklists, auditorías y ejecuciones
 */

/**
 * Categoría de plantillas (APERTURA, CIERRE, etc.)
 */
export interface Categoria {
    id: number;
    codigo: string;
    nombre: string;
    orden: number;
    plantillas: PlantillaResumen[];
}

/**
 * Resumen de plantilla (para listas)
 */
export interface PlantillaResumen {
    id: number;
    nombre: string;
    descripcion: string;
    totalItems: number;
}

/**
 * Plantilla completa con items
 */
export interface Plantilla {
    id: number;
    nombre: string;
    descripcion: string;
    instrucciones: string | null;
    version: number;
    requiereEvidencia: boolean;
    tipoCodigo: string;
    tipoNombre: string;
    categoriaCodigo: string;
    categoriaNombre: string;
    items: PlantillaItem[];
}

/**
 * Item de una plantilla
 */
export interface PlantillaItem {
    id: number;
    titulo: string;
    descripcion: string | null;
    orden: number;
    tipoRespuesta: 'CHECKBOX' | 'CUMPLE_NO_CUMPLE' | 'ESCALA_1_5' | 'TEXTO';
    requiereEvidencia: boolean;
    requiereObservacion: boolean;
    esCritico: boolean;
    peso: number;
}

/**
 * Ejecución de una plantilla
 */
export interface Ejecucion {
    id: number;
    plantillaId: number;
    sedeId: number;
    usuarioId: number;
    fecha: string;
    horaInicio: string;
    horaFin: string | null;
    estado: 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'PAUSADA';
    itemsTotal: number;
    itemsCompletados: number;
    itemsCumplidos: number;
    itemsNoCumplidos: number;
    porcentaje: number | null;
    observaciones: string | null;
    nombrePlantilla: string;
    nombreSede: string;
    nombreUsuario: string;
    tipoCodigo: string;
    categoriaCodigo: string;
    categoriaNombre: string;
    detalles: EjecucionDetalle[];
}

/**
 * Detalle de ejecución (respuesta a un item)
 */
export interface EjecucionDetalle {
    id: number;
    itemId: number;
    titulo: string;
    descripcion: string | null;
    orden: number;
    tipoRespuesta: string;
    requiereEvidencia: boolean;
    requiereObservacion: boolean;
    esCritico: boolean;
    completado: boolean | null;
    resultado: 'CUMPLE' | 'NO_CUMPLE' | 'NO_APLICA' | 'PENDIENTE' | null;
    valorEscala: number | null;
    respuestaTexto: string | null;
    observacion: string | null;
    fechaRespuesta: string | null;
}

/**
 * Resumen por categoría
 */
export interface ResumenCategoria {
    categoriaId: number;
    categoriaCodigo: string;
    categoriaNombre: string;
    totalPlantillas: number;
    completadas: number;
    enProgreso: number;
}

/**
 * Respuesta de estructura de tareas
 */
export interface EstructuraTareasResponse {
    fecha: string;
    tipo: string;
    categorias: Categoria[];
    ejecuciones: any[];
    resumen: ResumenCategoria[];
}