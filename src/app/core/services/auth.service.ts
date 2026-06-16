/**
 * AUTH SERVICE
 * 
 * Maneja toda la lógica de autenticación:
 * - Login/Logout
 * - Almacenamiento de sesión
 * - Estado del usuario actual
 * - Cambio de sede activa
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { 
    LoginRequest, 
    LoginResponse, 
    UserSession, 
    SedeActiva 
} from '../../shared/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // Clave para localStorage
    private readonly STORAGE_KEY = 'restocheck_session';

    // BehaviorSubject mantiene el estado actual y emite cambios
    // Permite que múltiples componentes escuchen cambios en la sesión
    private sessionSubject = new BehaviorSubject<UserSession | null>(null);
    
    // Observable público (solo lectura) para que componentes se suscriban
    public session$ = this.sessionSubject.asObservable();

    constructor(
        private api: ApiService,
        private router: Router
    ) {
        // Al iniciar, intentar recuperar sesión guardada
        this.loadStoredSession();
    }

    /**
     * Cargar sesión desde localStorage (si existe)
     */
    private loadStoredSession(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const session: UserSession = JSON.parse(stored);
                this.sessionSubject.next(session);
                console.log('✅ Sesión recuperada:', session.usuario.nombreUsuario);
            }
        } catch (error) {
            console.error('Error cargando sesión:', error);
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }

    /**
     * Realizar login (con validación de contraseña)
     * @param nombreUsuario - Nombre de usuario
     * @param password - Contraseña
     */
    login(nombreUsuario: string, password: string): Observable<LoginResponse> {
        const request: LoginRequest = { nombreUsuario, password };

        return this.api.post<LoginResponse>('/auth/login-real', request).pipe(
            tap(response => {
                if (response.success) {
                    // Crear objeto de sesión
                    const session: UserSession = {
                        usuario: response.data.usuario,
                        empresa: response.data.empresa,
                        rol: response.data.rol,
                        permisos: response.data.permisos,
                        sedes: response.data.sedes,
                        sedeActiva: response.data.sedeActiva
                    };

                    // Guardar en localStorage y actualizar estado
                    this.setSession(session);
                }
            })
        );
    }

    /**
     * Cerrar sesión
     */
    logout(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        this.sessionSubject.next(null);
        this.router.navigate(['/login']);
        console.log('👋 Sesión cerrada');
    }

    /**
     * Guardar sesión
     */
    private setSession(session: UserSession): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        this.sessionSubject.next(session);
        console.log('✅ Sesión guardada:', session.usuario.nombreUsuario);
    }

    /**
     * Obtener sesión actual (snapshot, no observable)
     */
    getSession(): UserSession | null {
        return this.sessionSubject.getValue();
    }

    /**
     * Verificar si hay usuario autenticado
     */
    isAuthenticated(): boolean {
        return this.sessionSubject.getValue() !== null;
    }

    /**
     * Verificar si el usuario tiene un permiso específico
     * @param codigoPermiso - Código del permiso (ej: 'VER_PANEL')
     */
    hasPermission(codigoPermiso: string): boolean {
        const session = this.getSession();
        if (!session) return false;
        
        return session.permisos.some(p => p.codigo === codigoPermiso);
    }

    /**
     * Verificar si tiene alguno de los permisos
     * @param codigos - Array de códigos de permisos
     */
    hasAnyPermission(codigos: string[]): boolean {
        return codigos.some(codigo => this.hasPermission(codigo));
    }

    /**
     * Cambiar sede activa
     * @param sede - Nueva sede activa
     */
    cambiarSede(sede: SedeActiva): void {
        const session = this.getSession();
        if (session) {
            session.sedeActiva = sede;
            this.setSession(session);
            console.log('🏢 Sede cambiada a:', sede.nombre);
        }
    }

    /**
     * Obtener sede activa actual
     */
    getSedeActiva(): SedeActiva | null {
        const session = this.getSession();
        return session?.sedeActiva || null;
    }

    /**
     * Obtener lista de sedes del usuario
     */
    getSedes(): SedeActiva[] {
        const session = this.getSession();
        return session?.sedes || [];
    }
}