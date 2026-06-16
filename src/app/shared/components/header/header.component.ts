/**
 * HEADER COMPONENT
 * 
 * Barra superior que muestra:
 * - Título de la sección actual
 * - Indicador de estado de conexión
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    
    // Título de la página actual (opcional)
    @Input() titulo: string = '';
    
    // Estado de conexión (siempre conectado por ahora)
    conectado: boolean = true;
}