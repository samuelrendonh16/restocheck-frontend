/**
 * AUTH GUARD
 * 
 * Protege rutas que requieren autenticación.
 * Si el usuario no está logueado, redirige al login.
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;  // Permitir acceso
    }

    // No autenticado: redirigir a login
    console.log('🚫 Acceso denegado - Redirigiendo a login');
    router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url }  // Guardar URL para volver después del login
    });
    return false;
};