import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

interface CategoriaPanel {
    categoriaId: number;
    codigo: string;
    nombre: string;
    orden: number;
    totalPlantillas: number;
    completadas: number;
    porcentaje: number;
}

interface ResumenPanel {
    totalEvaluaciones: number;
    evaluacionesCompletadas: number;
    progresoTotal: number;
    categorias: CategoriaPanel[];
}

@Component({
    selector: 'app-panel',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit {

    resumen: ResumenPanel | null = null;
    loading: boolean = false;

    nombreSede: string = '';
    sedeId: number = 1;

    fechaConsulta: string = new Date().toISOString().split('T')[0];

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private cdr: ChangeDetectorRef,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // Suscribirse a cambios de sesión/sede (reactivo)
        this.authService.session$.subscribe(session => {
            if (session) {
                this.nombreSede = session.sedeActiva?.nombre || 'Sin sede';

                const nuevaSedeId = session.sedeActiva?.id || 1;

                // Si cambió la sede, actualizar y recargar
                if (nuevaSedeId !== this.sedeId) {
                    this.sedeId = nuevaSedeId;
                    this.cargarResumen();
                }
            }
        });
    }

    /**
     * Cargar resumen del panel
     */
    cargarResumen(): void {
        this.loading = true;

        const url = `${this.apiUrl}/panel/resumen/${this.sedeId}?fecha=${this.fechaConsulta}`;

        this.http.get<any>(url).subscribe({
            next: (response) => {
                this.resumen = response.data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Cuando cambia la fecha
     */
    cambiarFecha(): void {
        this.cargarResumen();
    }

    /**
     * Icono según la categoría
     */
    getIcono(codigo: string): string {
        const iconos: { [key: string]: string } = {
            'APERTURA': '🌅',
            'OPERACION_CONTINUA': '🏃',
            'CIERRE': '🌙'
        };
        return iconos[codigo] || '📋';
    }

    /**
     * Estado de la sede según el progreso
     */
    get estadoSede(): string {
        if (!this.resumen) return '';
        const p = this.resumen.progresoTotal;
        if (p >= 80) return 'ÓPTIMO';
        if (p >= 50) return 'EN PROGRESO';
        return 'CRÍTICO';
    }

    get estadoClase(): string {
        if (!this.resumen) return '';
        const p = this.resumen.progresoTotal;
        if (p >= 80) return 'estado-optimo';
        if (p >= 50) return 'estado-progreso';
        return 'estado-critico';
    }
}
