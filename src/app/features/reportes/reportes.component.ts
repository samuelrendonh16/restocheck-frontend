import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface SedeCompliance {
    sedeId: number;
    nombre: string;
    tipoSede: string;
    totalEjecuciones: number;
    completadas: number;
    progreso: number;
    ultimaActividad: string | null;
}

interface Incidencia {
    detalleId: number;
    titulo: string;
    observacion: string | null;
    esCritico: boolean;
    plantilla: string;
    sede: string;
    fechaEjecucion: string;
}

interface SedeRanking {
    posicion: number;
    sedeId: number;
    nombre: string;
    tipoSede: string;
    totalEjecuciones: number;
    promedio: number;
}

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

    // Vista activa
    vistaActiva: string = 'COMPLIANCE';

    // Datos de compliance
    sedesCompliance: SedeCompliance[] = [];
    incidencias: Incidencia[] = [];
    ranking: SedeRanking[] = [];
    loading: boolean = false;

    // Rango de fechas (por defecto: último mes)
    fechaInicio: string = '';
    fechaFin: string = '';

    // Sesión
    empresaId: number = 1;

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const sessionStr = localStorage.getItem('restocheck_session');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            this.empresaId = session.usuario?.empresaId || session.empresa?.id || 1;
        }

        // Inicializar rango: último mes hasta hoy
        const hoy = new Date();
        const haceUnMes = new Date(hoy);
        haceUnMes.setMonth(hoy.getMonth() - 1);

        this.fechaFin = hoy.toISOString().split('T')[0];
        this.fechaInicio = haceUnMes.toISOString().split('T')[0];

        this.cargarCompliance();
    }

    /**
     * Cambiar vista del menú lateral
     */
    cambiarVista(vista: string): void {
        this.vistaActiva = vista;
        if (vista === 'COMPLIANCE') {
            this.cargarCompliance();
        }
        if (vista === 'INCIDENCIAS') {
            this.cargarIncidencias();
        }
        if (vista === 'RANKING') {
            this.cargarRanking();
        }
    }

    /**
     * Cargar datos de compliance
     */
    cargarCompliance(): void {
        this.loading = true;

        const url = `${this.apiUrl}/reportes/compliance/${this.empresaId}?inicio=${this.fechaInicio}&fin=${this.fechaFin}`;

        this.http.get<any>(url).subscribe({
            next: (response) => {
                this.sedesCompliance = response.data || [];
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
     * Cuando cambia el rango de fechas
     */
    aplicarFiltro(): void {
        if (this.fechaInicio && this.fechaFin) {
            if (this.vistaActiva === 'COMPLIANCE') {
                this.cargarCompliance();
            }
            if (this.vistaActiva === 'INCIDENCIAS') {
                this.cargarIncidencias();
            }
            if (this.vistaActiva === 'RANKING') {
                this.cargarRanking();
            }
        }
    }

    /**
     * Cargar ranking de sedes
     */
    cargarRanking(): void {
        this.loading = true;

        const url = `${this.apiUrl}/reportes/ranking/${this.empresaId}?inicio=${this.fechaInicio}&fin=${this.fechaFin}`;

        this.http.get<any>(url).subscribe({
            next: (response) => {
                this.ranking = response.data || [];
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
     * Cargar incidencias (items NO_CUMPLE)
     */
    cargarIncidencias(): void {
        this.loading = true;

        const url = `${this.apiUrl}/reportes/incidencias/${this.empresaId}?inicio=${this.fechaInicio}&fin=${this.fechaFin}`;

        this.http.get<any>(url).subscribe({
            next: (response) => {
                this.incidencias = response.data || [];
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
     * Color del indicador según el progreso
     */
    getColorEstado(progreso: number): string {
        if (progreso >= 80) return 'verde';
        if (progreso >= 50) return 'amarillo';
        return 'rojo';
    }

    /**
     * Formatear hora de última actividad
     */
    formatearHora(fecha: string | null): string {
        if (!fecha) return 'Sin actividad';
        const d = new Date(fecha);
        return d.toLocaleString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Clase CSS según la posición (medallas top 3)
     */
    getClasePosicion(posicion: number): string {
        if (posicion === 1) return 'oro';
        if (posicion === 2) return 'plata';
        if (posicion === 3) return 'bronce';
        return '';
    }

    /**
     * Formatear fecha
     */
    formatearFecha(fecha: string): string {
        if (!fecha) return '';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}
