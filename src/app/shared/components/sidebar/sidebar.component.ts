/**
 * SIDEBAR COMPONENT
 * 
 * Barra lateral de navegación que incluye:
 * - Logo y nombre de empresa
 * - Selector de sede activa
 * - Menú de navegación
 * - Info del usuario y logout
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserSession, Sede, SedeActiva } from '../../models';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

    session: UserSession | null = null;
    sedeActiva: SedeActiva | null = null;
    sedes: Sede[] = [];
    
    // Controla si el dropdown de sedes está abierto
    sedeDropdownOpen: boolean = false;

    // Menú de navegación
    menuItems = [
        { 
            label: 'Panel', 
            icon: '🏠', 
            route: '/panel',
            permiso: 'VER_PANEL'
        },
        { 
            label: 'Tareas', 
            icon: '✅', 
            route: '/tareas',
            permiso: 'VER_TAREAS'
        },
        { 
            label: 'Reportes', 
            icon: '📊', 
            route: '/reportes',
            permiso: 'VER_REPORTES'
        },
        { 
            label: 'Configuración', 
            icon: '⚙️', 
            route: '/configuracion',
            permiso: 'GESTIONAR_CONFIG'
        }
    ];

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        // Suscribirse a cambios en la sesión
        this.authService.session$.subscribe(session => {
            this.session = session;
            if (session) {
                this.sedes = session.sedes;
                this.sedeActiva = session.sedeActiva;
            }
        });
    }

    /**
     * Verificar si el usuario tiene permiso para ver un item del menú
     */
    hasPermission(codigoPermiso: string): boolean {
        return this.authService.hasPermission(codigoPermiso);
    }

    /**
     * Toggle del dropdown de sedes
     */
    toggleSedeDropdown(): void {
        this.sedeDropdownOpen = !this.sedeDropdownOpen;
    }

    /**
     * Cambiar sede activa
     */
    cambiarSede(sede: Sede): void {
        const sedeActiva: SedeActiva = {
            id: sede.id,
            nombre: sede.nombre,
            codigo: sede.codigo
        };
        this.authService.cambiarSede(sedeActiva);
        this.sedeActiva = sedeActiva;
        this.sedeDropdownOpen = false;
    }

    /**
     * Cerrar sesión
     */
    logout(): void {
        this.authService.logout();
    }
}