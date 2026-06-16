/**
 * TAREAS SERVICE - PASO 2
 * Solo obtener categorías por ahora
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

// Interface para categoría
export interface Categoria {
    id: number;
    codigo: string;
    nombre: string;
    orden: number;
}

// Interface para respuesta
export interface CategoriasResponse {
    success: boolean;
    data: Categoria[];
}

@Injectable({
    providedIn: 'root'
})
export class TareasService {

    constructor(private api: ApiService) { }

    /**
     * Obtener categorías por tipo
     * @param tipo - 'CHECKLIST' o 'AUDITORIA'
     */
    getCategorias(tipo: string): Observable<CategoriasResponse> {
        return this.api.get<CategoriasResponse>(`/tareas/categorias/${tipo}`);
    }
}