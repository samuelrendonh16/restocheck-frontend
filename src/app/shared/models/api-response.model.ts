/**
 * MODELOS DE RESPUESTA API
 * 
 * Estructuras genéricas para las respuestas del backend.
 */

/**
 * Respuesta exitosa genérica
 */
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    count?: number;
}

/**
 * Respuesta de error
 */
export interface ApiError {
    success: false;
    error: {
        message: string;
        stack?: string;
    };
}