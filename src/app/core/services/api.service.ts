/**
 * API SERVICE
 * 
 * Servicio base para todas las llamadas HTTP al backend.
 * Centraliza la configuración y manejo de errores.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'  // Disponible en toda la app sin importar en módulos
})
export class ApiService {

    // URL base del backend (desde environment)
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /**
     * GET request
     * @param endpoint - Ruta relativa (ej: '/auth/users')
     */
    get<T>(endpoint: string): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}${endpoint}`)
            .pipe(catchError(this.handleError));
    }

    /**
     * POST request
     * @param endpoint - Ruta relativa
     * @param data - Datos a enviar en el body
     */
    post<T>(endpoint: string, data: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${endpoint}`, data)
            .pipe(catchError(this.handleError));
    }

    /**
     * PUT request
     * @param endpoint - Ruta relativa
     * @param data - Datos a enviar
     */
    put<T>(endpoint: string, data: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${endpoint}`, data)
            .pipe(catchError(this.handleError));
    }

    /**
     * DELETE request
     * @param endpoint - Ruta relativa
     */
    delete<T>(endpoint: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}${endpoint}`)
            .pipe(catchError(this.handleError));
    }

    /**
     * Manejo centralizado de errores HTTP
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Ocurrió un error desconocido';

        if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente (red, etc.)
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del lado del servidor
            if (error.error && error.error.error && error.error.error.message) {
                errorMessage = error.error.error.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
        }

        console.error('API Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}