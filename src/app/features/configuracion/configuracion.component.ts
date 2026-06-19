import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Sede {
    id: number;
    nombre: string;
    codigoCorto: string;
    ciudad: string;
    tipoSede: string;
    tipoSedeId: number;
    activa: boolean;
}

interface TipoSede {
    id: number;
    nombre: string;
}

interface Usuario {
    id: number;
    nombreCompleto: string;
    nombreUsuario: string;
    email: string | null;
    rolId: number;
    rolNombre: string;
    rolCodigo: string;
    rolEsSistema: boolean;
    sedeId: number | null;
    sedeNombre: string | null;
}

interface Rol {
    id: number;
    codigo: string;
    nombre: string;
    requiereSede: boolean;
    accesoGlobal: boolean;
    orden: number;
}

interface PlantillaConfig {
    id: number;
    nombre: string;
    descripcion: string;
    tipoCodigo: string;
    tipoNombre: string;
    categoriaId: number;
    categoriaNombre: string;
    totalItems: number;
}

interface CategoriaConfig {
    id: number;
    codigo: string;
    nombre: string;
    orden: number;
}

interface ItemPlantilla {
    id: number;
    titulo: string;
    descripcion: string;
    orden: number;
    tipoRespuesta: string;
    esCritico: boolean;
    requiereEvidencia: boolean;
}

interface RolMatriz {
    id: number;
    codigo: string;
    nombre: string;
    orden: number;
}

interface PermisoMatriz {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    modulo: string;
    orden: number;
}

interface AsignacionMatriz {
    rolId: number;
    permisoId: number;
    habilitado: boolean;
}

@Component({
    selector: 'app-configuracion',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './configuracion.component.html',
    styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {

    // Pestaña activa
    pestanaActiva: string = 'SEDES';

    // Sedes
    sedes: Sede[] = [];
    tiposSede: TipoSede[] = [];
    loadingSedes: boolean = false;

    // Formulario nueva sede
    nuevaSede = {
        nombre: '',
        codigoCorto: '',
        tipoSedeId: null as number | null,
        ciudad: ''
    };

    // Usuarios
    usuarios: Usuario[] = [];
    roles: Rol[] = [];
    loadingUsuarios: boolean = false;

    // Formulario nuevo usuario
    nuevoUsuario = {
        nombreCompleto: '',
        rolId: null as number | null,
        sedeId: null as number | null,
        password: ''
    };

    // Plantillas
    plantillas: PlantillaConfig[] = [];
    categoriasDisponibles: CategoriaConfig[] = [];
    loadingPlantillas: boolean = false;

    // Formulario nueva plantilla
    nuevaPlantilla = {
        nombre: '',
        descripcion: '',
        tipoCodigo: 'CHECKLIST',
        categoriaId: null as number | null
    };

    // Items de plantilla
    plantillaSeleccionada: PlantillaConfig | null = null;
    itemsPlantilla: ItemPlantilla[] = [];
    loadingItems: boolean = false;

    // Formulario nuevo item
    nuevoItem = {
        titulo: '',
        descripcion: '',
        tipoRespuesta: 'CHECKBOX',
        esCritico: false
    };

    // Matriz de roles/permisos
    matrizRoles: RolMatriz[] = [];
    matrizPermisos: PermisoMatriz[] = [];
    matrizAsignaciones: AsignacionMatriz[] = [];
    loadingMatriz: boolean = false;

    // Cambios pendientes de la matriz: clave "rolId-permisoId" -> habilitado
    cambiosPendientes = new Map<string, boolean>();
    guardandoMatriz: boolean = false;

    // Rol expandido en la vista móvil (acordeón)
    rolExpandido: number | null = null;

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
            this.empresaId = session.usuario?.empresaId || 1;
        }

        this.cargarSedes();
        this.cargarTiposSede();
        this.cargarUsuarios();
        this.cargarRoles();
    }

    /**
     * Cambiar de pestaña
     */
    cambiarPestana(pestana: string): void {
        this.pestanaActiva = pestana;

        if (pestana === 'USERS') {
            this.cargarUsuarios();
        }
        if (pestana === 'PLANTILLAS') {
            this.cargarPlantillas();
            this.cargarCategoriasDisponibles();
        }
        if (pestana === 'ROLES') {
            this.cargarMatriz();
        }
    }

    /**
     * Cargar lista de sedes
     */
    cargarSedes(): void {
        this.loadingSedes = true;

        this.http.get<any>(`${this.apiUrl}/sedes/${this.empresaId}`).subscribe({
            next: (response) => {
                this.sedes = response.data || [];
                this.loadingSedes = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                this.loadingSedes = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Cargar tipos de sede (para el dropdown)
     */
    cargarTiposSede(): void {
        this.http.get<any>(`${this.apiUrl}/sedes/tipos/lista`).subscribe({
            next: (response) => {
                this.tiposSede = response.data || [];
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
            }
        });
    }

    /**
     * Crear nueva sede
     */
    crearSede(): void {
        // Validaciones
        if (!this.nuevaSede.nombre.trim()) {
            alert('El nombre es obligatorio');
            return;
        }
        if (this.nuevaSede.codigoCorto.length !== 3) {
            alert('El código debe tener exactamente 3 caracteres');
            return;
        }
        if (!this.nuevaSede.tipoSedeId) {
            alert('Selecciona un tipo de sede');
            return;
        }

        const body = {
            empresaId: this.empresaId,
            nombre: this.nuevaSede.nombre.trim(),
            codigoCorto: this.nuevaSede.codigoCorto.toUpperCase(),
            tipoSedeId: this.nuevaSede.tipoSedeId,
            ciudad: this.nuevaSede.ciudad.trim()
        };

        this.http.post<any>(`${this.apiUrl}/sedes`, body).subscribe({
            next: () => {
                // Limpiar formulario
                this.nuevaSede = {
                    nombre: '',
                    codigoCorto: '',
                    tipoSedeId: null,
                    ciudad: ''
                };
                // Recargar lista
                this.cargarSedes();
                this.cdr.detectChanges();
            },
            error: (err) => {
                const mensaje = err.error?.error?.message || 'Error al crear la sede';
                alert(mensaje);
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Cargar usuarios
     */
    cargarUsuarios(): void {
        this.loadingUsuarios = true;

        this.http.get<any>(`${this.apiUrl}/usuarios/${this.empresaId}`).subscribe({
            next: (response) => {
                this.usuarios = response.data || [];
                this.loadingUsuarios = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                this.loadingUsuarios = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Cargar roles (para dropdown)
     */
    cargarRoles(): void {
        this.http.get<any>(`${this.apiUrl}/roles/${this.empresaId}`).subscribe({
            next: (response) => {
                this.roles = response.data || [];
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
            }
        });
    }

    /**
     * Saber si el rol seleccionado requiere sede
     */
    get rolRequiereSede(): boolean {
        if (!this.nuevoUsuario.rolId) return false;
        const rol = this.roles.find(r => r.id === this.nuevoUsuario.rolId);
        return rol ? rol.requiereSede : false;
    }

    /**
     * Crear usuario
     */
    crearUsuario(): void {
        if (!this.nuevoUsuario.nombreCompleto.trim()) {
            alert('El nombre completo es obligatorio');
            return;
        }
        if (!this.nuevoUsuario.rolId) {
            alert('Selecciona un rol');
            return;
        }
        if (!this.nuevoUsuario.password || this.nuevoUsuario.password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const body = {
            empresaId: this.empresaId,
            nombreCompleto: this.nuevoUsuario.nombreCompleto.trim(),
            rolId: this.nuevoUsuario.rolId,
            sedeId: this.rolRequiereSede ? this.nuevoUsuario.sedeId : null,
            password: this.nuevoUsuario.password
        };

        this.http.post<any>(`${this.apiUrl}/usuarios`, body).subscribe({
            next: (response) => {
                const data = response.data;
                alert(
                    `✅ Usuario creado\n\n` +
                    `Usuario: ${data.nombreUsuario}\n\n` +
                    `Comunícale al usuario su nombre de usuario y la contraseña que asignaste.`
                );

                this.nuevoUsuario = {
                    nombreCompleto: '',
                    rolId: null,
                    sedeId: null,
                    password: ''
                };

                this.cargarUsuarios();
                this.cdr.detectChanges();
            },
            error: (err) => {
                const mensaje = err.error?.error?.message || 'Error al crear el usuario';
                alert(mensaje);
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Eliminar usuario
     */
    eliminarUsuario(usuario: Usuario): void {
        if (usuario.rolEsSistema && usuario.rolCodigo === 'ADMIN_SISTEMA') {
            alert('No se puede eliminar el administrador del sistema');
            return;
        }

        if (!confirm(`¿Eliminar al usuario "${usuario.nombreCompleto}"?`)) return;

        this.http.delete<any>(`${this.apiUrl}/usuarios/${usuario.id}`).subscribe({
            next: () => {
                this.cargarUsuarios();
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                alert('Error al eliminar el usuario');
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Cargar plantillas
     */
    cargarPlantillas(): void {
        this.loadingPlantillas = true;

        this.http.get<any>(`${this.apiUrl}/plantillas-config/${this.empresaId}`).subscribe({
            next: (response) => {
                this.plantillas = response.data || [];
                this.loadingPlantillas = false;
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
     * Cargar categorías según el tipo seleccionado
     */
    cargarCategoriasDisponibles(): void {
        const tipo = this.nuevaPlantilla.tipoCodigo;

        this.http.get<any>(`${this.apiUrl}/tareas/categorias/${tipo}`).subscribe({
            next: (response) => {
                this.categoriasDisponibles = response.data || [];
                this.nuevaPlantilla.categoriaId = null;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
            }
        });
    }

    /**
     * Cuando cambia el tipo, recargar categorías
     */
    cambiarTipoPlantilla(): void {
        this.cargarCategoriasDisponibles();
    }

    /**
     * Crear plantilla
     */
    crearPlantilla(): void {
        if (!this.nuevaPlantilla.nombre.trim()) {
            alert('El título es obligatorio');
            return;
        }
        if (!this.nuevaPlantilla.categoriaId) {
            alert('Selecciona una categoría');
            return;
        }

        const body = {
            empresaId: this.empresaId,
            nombre: this.nuevaPlantilla.nombre.trim(),
            descripcion: this.nuevaPlantilla.descripcion.trim(),
            tipoCodigo: this.nuevaPlantilla.tipoCodigo,
            categoriaId: this.nuevaPlantilla.categoriaId
        };

        this.http.post<any>(`${this.apiUrl}/plantillas-config`, body).subscribe({
            next: () => {
                this.nuevaPlantilla = {
                    nombre: '',
                    descripcion: '',
                    tipoCodigo: this.nuevaPlantilla.tipoCodigo,
                    categoriaId: null
                };
                this.cargarPlantillas();
                this.cdr.detectChanges();
            },
            error: (err) => {
                const mensaje = err.error?.error?.message || 'Error al crear la plantilla';
                alert(mensaje);
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Eliminar plantilla
     */
    eliminarPlantilla(plantilla: PlantillaConfig): void {
        if (!confirm(`¿Eliminar la plantilla "${plantilla.nombre}"?`)) return;

        this.http.delete<any>(`${this.apiUrl}/plantillas-config/${plantilla.id}`).subscribe({
            next: () => {
                this.cargarPlantillas();
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                alert('Error al eliminar la plantilla');
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Abrir detalle de plantilla (gestionar items)
     */
    abrirPlantilla(plantilla: PlantillaConfig): void {
        this.plantillaSeleccionada = plantilla;
        this.cargarItems(plantilla.id);
    }

    /**
     * Volver a la lista de plantillas
     */
    cerrarDetallePlantilla(): void {
        this.plantillaSeleccionada = null;
        this.itemsPlantilla = [];
        this.cargarPlantillas();
    }

    /**
     * Cargar items de la plantilla
     */
    cargarItems(plantillaId: number): void {
        this.loadingItems = true;
        this.itemsPlantilla = [];

        this.http.get<any>(`${this.apiUrl}/plantillas-config/${plantillaId}/items`).subscribe({
            next: (response) => {
                this.itemsPlantilla = response.data || [];
                this.loadingItems = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                this.loadingItems = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Crear item
     */
    crearItem(): void {
        if (!this.plantillaSeleccionada) return;

        if (!this.nuevoItem.titulo.trim()) {
            alert('El título del item es obligatorio');
            return;
        }

        const body = {
            titulo: this.nuevoItem.titulo.trim(),
            descripcion: this.nuevoItem.descripcion.trim(),
            tipoRespuesta: this.nuevoItem.tipoRespuesta,
            esCritico: this.nuevoItem.esCritico
        };

        this.http.post<any>(
            `${this.apiUrl}/plantillas-config/${this.plantillaSeleccionada.id}/items`,
            body
        ).subscribe({
            next: () => {
                this.nuevoItem = {
                    titulo: '',
                    descripcion: '',
                    tipoRespuesta: this.nuevoItem.tipoRespuesta,
                    esCritico: false
                };
                this.cargarItems(this.plantillaSeleccionada!.id);
                this.cdr.detectChanges();
            },
            error: (err) => {
                const mensaje = err.error?.error?.message || 'Error al crear el item';
                alert(mensaje);
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Eliminar item
     */
    eliminarItem(item: ItemPlantilla): void {
        if (!confirm(`¿Eliminar el item "${item.titulo}"?`)) return;

        this.http.delete<any>(`${this.apiUrl}/plantillas-config/items/${item.id}`).subscribe({
            next: () => {
                this.cargarItems(this.plantillaSeleccionada!.id);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                alert('Error al eliminar el item');
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Etiqueta legible del tipo de respuesta
     */
    getTipoRespuestaLabel(tipo: string): string {
        const labels: { [key: string]: string } = {
            'CHECKBOX': 'Checkbox',
            'CUMPLE_NO_CUMPLE': 'Cumple/No cumple',
            'ESCALA_1_5': 'Escala 1-5',
            'TEXTO': 'Texto'
        };
        return labels[tipo] || tipo;
    }

    /**
     * Cargar matriz de permisos
     */
    cargarMatriz(): void {
        this.loadingMatriz = true;

        this.http.get<any>(`${this.apiUrl}/roles/${this.empresaId}/matriz`).subscribe({
            next: (response) => {
                const data = response.data;
                this.matrizRoles = data.roles || [];
                this.matrizPermisos = data.permisos || [];
                this.matrizAsignaciones = data.asignaciones || [];
                this.cambiosPendientes.clear();
                this.loadingMatriz = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                this.loadingMatriz = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Verificar si un rol tiene un permiso habilitado
     */
    tienePermiso(rolId: number, permisoId: number): boolean {
        const asignacion = this.matrizAsignaciones.find(
            a => a.rolId === rolId && a.permisoId === permisoId
        );
        return asignacion ? asignacion.habilitado : false;
    }

    /**
     * Alternar un permiso (solo en memoria, no guarda aún)
     */
    togglePermiso(rolId: number, permisoId: number): void {
        const nuevoValor = !this.tienePermiso(rolId, permisoId);

        // Actualizar el estado visual
        const asignacion = this.matrizAsignaciones.find(
            a => a.rolId === rolId && a.permisoId === permisoId
        );

        if (asignacion) {
            asignacion.habilitado = nuevoValor;
        } else {
            this.matrizAsignaciones.push({ rolId, permisoId, habilitado: nuevoValor });
        }

        // Registrar el cambio como pendiente
        const clave = `${rolId}-${permisoId}`;
        this.cambiosPendientes.set(clave, nuevoValor);

        this.cdr.detectChanges();
    }

    /**
     * Saber si hay cambios sin guardar
     */
    get hayCambiosPendientes(): boolean {
        return this.cambiosPendientes.size > 0;
    }

    /**
     * Guardar todos los cambios pendientes
     */
    guardarMatriz(): void {
        if (this.cambiosPendientes.size === 0) return;

        this.guardandoMatriz = true;

        // Convertir el Map en un array de peticiones
        const peticiones = Array.from(this.cambiosPendientes.entries()).map(([clave, habilitado]) => {
            const [rolId, permisoId] = clave.split('-').map(Number);
            return firstValueFrom(this.http.put<any>(
                `${this.apiUrl}/roles/${rolId}/permiso/${permisoId}`,
                { habilitado }
            ));
        });

        // Ejecutar todas y esperar a que terminen
        Promise.all(peticiones)
            .then(() => {
                this.cambiosPendientes.clear();
                this.guardandoMatriz = false;
                alert('✅ Cambios guardados correctamente');
                this.cdr.detectChanges();
            })
            .catch((err) => {
                console.error('Error guardando:', err);
                this.guardandoMatriz = false;
                alert('Error al guardar algunos cambios. Recarga e intenta de nuevo.');
                this.cdr.detectChanges();
            });
    }

    /**
     * Eliminar sede
     */
    eliminarSede(sede: Sede): void {
        if (!confirm(`¿Eliminar la sede "${sede.nombre}"?`)) return;

        this.http.delete<any>(`${this.apiUrl}/sedes/${sede.id}`).subscribe({
            next: () => {
                this.cargarSedes();
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error:', err);
                alert('Error al eliminar la sede');
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Expandir/colapsar un rol en la vista móvil
     */
    toggleRolExpandido(rolId: number): void {
        this.rolExpandido = this.rolExpandido === rolId ? null : rolId;
    }

    /**
     * Contar permisos habilitados de un rol (para mostrar en el acordeón)
     */
    contarPermisosRol(rolId: number): number {
        return this.matrizAsignaciones.filter(
            a => a.rolId === rolId && a.habilitado
        ).length;
    }
}
