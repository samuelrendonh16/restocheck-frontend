import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Categoria {
    id: number;
    codigo: string;
    nombre: string;
    orden: number;
}

interface EstadoCategoria {
    categoriaId: number;
    totalPlantillas: number;
    completadas: number;
}

interface EstadoPlantilla {
    plantillaId: number;
    estado: string | null;
    porcentaje: number | null;
}

interface Plantilla {
    id: number;
    nombre: string;
    descripcion: string;
}

interface ItemEjecucion {
    id: number;
    titulo: string;
    descripcion: string;
    orden: number;
    tipoRespuesta: string;
    esCritico: boolean;
    completado: boolean | null;
    resultado: string | null;
    observacion?: string;
}

interface Ejecucion {
    id: number;
    plantillaId: number;
    nombrePlantilla: string;
    categoriaNombre: string;
    estado: string;
    itemsTotal: number;
    itemsCompletados?: number;
    itemsCumplidos?: number;
    itemsNoCumplidos?: number;
    porcentaje?: number;
    horaInicio?: string;
    horaFin?: string;
    items: ItemEjecucion[];
}

@Component({
    selector: 'app-tareas',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './tareas.component.html',
    styleUrls: ['./tareas.component.css']
})
export class TareasComponent implements OnInit {

    tipoActivo: string = 'CHECKLIST';
    
    categorias: Categoria[] = [];
    estadoCategorias: EstadoCategoria[] = [];
    estadoPlantillas: EstadoPlantilla[] = [];
    categoriaSeleccionada: Categoria | null = null;
    
    plantillas: Plantilla[] = [];
    
    ejecucionActiva: Ejecucion | null = null;
    
    loadingCategorias: boolean = false;
    loadingPlantillas: boolean = false;
    loadingEjecucion: boolean = false;
    
    nombreSede: string = '';
    sedeId: number = 1;
    usuarioId: number = 1;
    rolId: number | null = null;
    fechaConsulta: string = new Date().toISOString().split('T')[0];

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const sessionStr = localStorage.getItem('restocheck_session');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            this.nombreSede = session.sedeActiva?.nombre || 'Sin sede';
            this.sedeId = session.sedeActiva?.id || 1;
            this.usuarioId = session.usuario?.id || 1;
            this.rolId = session.rol?.id || null;
        }
        
        this.cargarCategorias();
    }

    /**
     * Cargar categorías y su estado
     */
    cargarCategorias(): void {
        this.loadingCategorias = true;
        this.categorias = [];
        this.estadoCategorias = [];
        this.categoriaSeleccionada = null;
        this.plantillas = [];
        this.ejecucionActiva = null;

        // Cargar categorías
        this.http.get<any>(`${this.apiUrl}/tareas/categorias/${this.tipoActivo}`).subscribe({
            next: (response) => {
                this.categorias = response.data || [];
                this.loadingCategorias = false;
                
                // Cargar estado de las categorías
                this.cargarEstadoCategorias();
                
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                this.loadingCategorias = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Verificar si la fecha consultada es hoy
     */
    esHoy(): boolean {
        const hoy = new Date().toISOString().split('T')[0];
        return this.fechaConsulta === hoy;
    }

    /**
     * Cargar estado de categorías (pendientes/completadas)
     */
    cargarEstadoCategorias(): void {
        const url = `${this.apiUrl}/tareas/estado/${this.sedeId}/${this.tipoActivo}?fecha=${this.fechaConsulta}`;
        this.http.get<any>(url).subscribe({
            next: (response) => {
                this.estadoCategorias = response.data || [];
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error cargando estado:', err);
            }
        });
    }

    /**
     * Verificar si una categoría tiene tareas pendientes
     */
    tienePendientes(categoriaId: number): boolean {
        const estado = this.estadoCategorias.find(e => e.categoriaId === categoriaId);
        if (!estado) return true; // Si no hay estado, asumimos pendiente
        return estado.completadas < estado.totalPlantillas;
    }

    /**
     * Seleccionar categoría
     */
    seleccionarCategoria(categoria: Categoria): void {
        this.categoriaSeleccionada = categoria;
        this.ejecucionActiva = null;
        this.cargarPlantillas(categoria.id);
    }

    /**
     * Cargar plantillas
     */
    cargarPlantillas(categoriaId: number): void {
        this.loadingPlantillas = true;
        this.plantillas = [];
        this.estadoPlantillas = [];

        this.http.get<any>(`${this.apiUrl}/tareas/plantillas/${categoriaId}`).subscribe({
            next: (response) => {
                this.plantillas = response.data || [];
                this.loadingPlantillas = false;

                // Cargar estado de las plantillas
                this.cargarEstadoPlantillas(categoriaId);

                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                this.loadingPlantillas = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Cargar estado de plantillas (completadas/pendientes)
     */
    cargarEstadoPlantillas(categoriaId: number): void {
        const url = `${this.apiUrl}/tareas/plantillas/${categoriaId}/estado/${this.sedeId}?fecha=${this.fechaConsulta}`;

        this.http.get<any>(url).subscribe({
            next: (response) => {
                this.estadoPlantillas = response.data || [];
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error cargando estado plantillas:', err);
            }
        });
    }

    /**
     * Obtener estado de una plantilla
     */
    getEstadoPlantilla(plantillaId: number): EstadoPlantilla | null {
        return this.estadoPlantillas.find(e => e.plantillaId === plantillaId) || null;
    }

    /**
     * Verificar si una plantilla está completada
     */
    plantillaCompletada(plantillaId: number): boolean {
        const estado = this.getEstadoPlantilla(plantillaId);
        return estado?.estado === 'COMPLETADA';
    }

    /**
     * Seleccionar plantilla - verificar si ya existe ejecución
     */
    seleccionarPlantilla(plantilla: Plantilla): void {
        this.loadingEjecucion = true;

        const url = `${this.apiUrl}/tareas/ejecucion/buscar/${plantilla.id}/${this.sedeId}?fecha=${this.fechaConsulta}`;

        this.http.get<any>(url).subscribe({
            next: (response) => {
                const ejecucionExistente = response.data;

                if (ejecucionExistente) {
                    if (ejecucionExistente.estado === 'COMPLETADA') {
                        this.ejecucionActiva = {
                            ...ejecucionExistente,
                            categoriaNombre: this.categoriaSeleccionada?.nombre || '',
                            items: ejecucionExistente.items || []
                        };
                        this.loadingEjecucion = false;
                        this.cdr.detectChanges();
                    } else {
                        this.ejecucionActiva = {
                            ...ejecucionExistente,
                            categoriaNombre: this.categoriaSeleccionada?.nombre || ''
                        };
                        this.loadingEjecucion = false;
                        this.cdr.detectChanges();
                    }
                } else {
                    // Solo crear nueva si es hoy
                    if (this.esHoy()) {
                        this.crearNuevaEjecucion(plantilla);
                    } else {
                        // Fecha pasada sin ejecución - mostrar mensaje
                        this.ejecucionActiva = null;
                        this.loadingEjecucion = false;
                        alert('No hay registro de esta tarea en la fecha seleccionada');
                        this.cdr.detectChanges();
                    }
                }
            },
            error: (err) => {
                console.error('Error buscando ejecución:', err);
                if (this.esHoy()) {
                    this.crearNuevaEjecucion(plantilla);
                } else {
                    this.loadingEjecucion = false;
                    this.cdr.detectChanges();
                }
            }
        });
    }

/**
 * Crear nueva ejecución
 */
    crearNuevaEjecucion(plantilla: Plantilla): void {
    const body = {
        plantillaId: plantilla.id,
        sedeId: this.sedeId,
        usuarioId: this.usuarioId,
        rolId: this.rolId
    };

    this.http.post<any>(`${this.apiUrl}/tareas/ejecucion/iniciar`, body).subscribe({
        next: (response) => {
            this.ejecucionActiva = response.data;
            this.loadingEjecucion = false;
            this.cdr.detectChanges();
        },
        error: (err) => {
            console.error('Error:', err);
            this.loadingEjecucion = false;

            // Mostrar mensaje si fue rechazo de permisos (403)
            if (err.status === 403) {
                const mensaje = err.error?.error?.message || 'No tienes permiso para esta acción';
                alert('🚫 ' + mensaje);
            } else {
                alert('Error al iniciar la tarea');
            }

            this.cdr.detectChanges();
        }
    });
}

    /**
 * Marcar item como completado
 */
marcarItem(item: ItemEjecucion, completado: boolean): void {
    if (!this.ejecucionActiva) return;

    item.completado = completado;

    this.guardarItem(item);
}

/**
 * Guardar item (completado + observación)
 */
guardarItem(item: ItemEjecucion): void {
    if (!this.ejecucionActiva) return;

    this.http.put<any>(
        `${this.apiUrl}/tareas/ejecucion/${this.ejecucionActiva.id}/item/${item.id}`,
        { 
            completado: item.completado,
            observacion: item.observacion || null
        }
    ).subscribe({
        next: () => {
            console.log('✅ Item guardado');
            this.cdr.detectChanges();
        },
        error: (err) => {
            console.error('Error:', err);
            this.cdr.detectChanges();
        }
    });
}

/**
 * Guardar observación con debounce (al perder foco)
 */
guardarObservacion(item: ItemEjecucion): void {
    if (!this.ejecucionActiva || item.completado === null) return;
    
    this.guardarItem(item);
}
    /**
     * Finalizar la ejecución
     */
    finalizarEjecucion(): void {
        if (!this.ejecucionActiva || !this.todosCompletados) return;

        if (!confirm('¿Estás seguro de finalizar este control?')) return;

        this.http.put<any>(
            `${this.apiUrl}/tareas/ejecucion/${this.ejecucionActiva.id}/finalizar`,
            {}
        ).subscribe({
            next: (response) => {
                const resultado = response.data;
                alert(`✅ Control finalizado\n\nCumplimiento: ${resultado.porcentaje}%`);
                
                this.ejecucionActiva = null;
                
                // Recargar estado de categorías
                this.cargarEstadoCategorias();

                // Recargar estado de plantillas
                if (this.categoriaSeleccionada) {
                    this.cargarEstadoPlantillas(this.categoriaSeleccionada.id);
                }

                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                alert('Error al finalizar');
                this.cdr.detectChanges();
            }
        });
    }

    get itemsCompletados(): number {
        if (!this.ejecucionActiva) return 0;
        return this.ejecucionActiva.items.filter(i => i.completado !== null).length;
    }

    get todosCompletados(): boolean {
        if (!this.ejecucionActiva) return false;
        return this.itemsCompletados === this.ejecucionActiva.itemsTotal;
    }

    cambiarTipo(tipo: string): void {
        if (this.tipoActivo !== tipo) {
            this.tipoActivo = tipo;
            this.cargarCategorias();
        }
    }

    volverAPlantillas(): void {
        this.ejecucionActiva = null;
    }

    esControl(): boolean {
        return this.tipoActivo === 'CHECKLIST';
    }

    esAuditoria(): boolean {
        return this.tipoActivo === 'AUDITORIA';
    }

    /**
     * Cuando cambia la fecha de consulta
     */
    cambiarFecha(): void {
        this.ejecucionActiva = null;
        this.categoriaSeleccionada = null;
        this.plantillas = [];
        this.cargarEstadoCategorias();
    }
}