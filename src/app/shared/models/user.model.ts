/**
 * MODELOS DE USUARIO
 * 
 * Interfaces que definen la estructura de datos de usuarios,
 * basadas en el schema de la base de datos RestoCheckDB.
 */

/**
 * Usuario básico (para listas)
 */
export interface User {
    id: number;
    nombreCompleto: string;
    nombreUsuario: string;
    email: string | null;
    empresaId?: number;
    requiereCambioPass?: boolean;
}

/**
 * Empresa del usuario
 */
export interface Empresa {
    id: number;
    nombre: string;
    codigo: string;
}

/**
 * Rol del usuario
 */
export interface Rol {
    id: number;
    nombre: string;
    codigo: string;
    accesoGlobal: boolean;
    requiereSede: boolean;
}

/**
 * Permiso individual
 */
export interface Permiso {
    codigo: string;
    nombre: string;
    modulo: string;
}

/**
 * Sede
 */
export interface Sede {
    id: number;
    nombre: string;
    codigo: string;
    ciudad: string | null;
    tipo: string;
    esPrincipal: boolean;
}

/**
 * Sede activa (versión simplificada)
 */
export interface SedeActiva {
    id: number;
    nombre: string;
    codigo: string;
}

/**
 * Respuesta completa del login
 * Estructura que retorna el backend en POST /api/auth/login
 */
export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        usuario: User;
        empresa: Empresa;
        rol: Rol;
        permisos: Permiso[];
        sedes: Sede[];
        sedeActiva: SedeActiva | null;
    };
}

/**
 * Sesión del usuario (lo que guardamos en el frontend)
 */
export interface UserSession {
    usuario: User;
    empresa: Empresa;
    rol: Rol;
    permisos: Permiso[];
    sedes: Sede[];
    sedeActiva: SedeActiva | null;
}

/**
 * Request de login
 */
export interface LoginRequest {
    nombreUsuario: string;
    password: string;
}