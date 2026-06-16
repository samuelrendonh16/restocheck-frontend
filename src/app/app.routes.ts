/**
 * APP ROUTES
 * 
 * Estructura de rutas:
 * - /login -> Público (sin layout)
 * - /* -> Protegido (con layout: sidebar + header)
 */

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
    // Login (público, sin layout)
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component')
            .then(m => m.LoginComponent)
    },

    // Rutas protegidas (con layout)
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            // Redirección por defecto
            {
                path: '',
                redirectTo: 'panel',
                pathMatch: 'full'
            },
            // Panel
            {
                path: 'panel',
                loadComponent: () => import('./features/panel/panel.component')
                    .then(m => m.PanelComponent)
            },
            // Tareas (placeholder por ahora)
            {
                path: 'tareas',
                loadComponent: () => import('./features/tareas/tareas.component')
                    .then(m => m.TareasComponent)
            },
            // Reportes (placeholder por ahora)
            {
                path: 'reportes',
                loadComponent: () => import('./features/reportes/reportes.component')
                    .then(m => m.ReportesComponent)
            },
            // Configuración (placeholder por ahora)
            {
                path: 'configuracion',
                loadComponent: () => import('./features/configuracion/configuracion.component')
                    .then(m => m.ConfiguracionComponent)
            }
        ]
    },

    // Ruta comodín
    {
        path: '**',
        redirectTo: 'login'
    }
];