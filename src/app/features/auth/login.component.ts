/**
 * LOGIN COMPONENT
 * Pantalla de inicio de sesión con validación de contraseña.
 */

import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {

    nombreUsuario: string = '';
    password: string = '';

    loading: boolean = false;
    error: string = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/panel']);
        }
    }

    onSubmit(): void {
        if (!this.nombreUsuario.trim()) {
            this.error = 'Ingresa tu nombre de usuario';
            return;
        }
        if (!this.password) {
            this.error = 'Ingresa tu contraseña';
            return;
        }

        this.loading = true;
        this.error = '';

        this.authService.login(this.nombreUsuario.trim(), this.password).subscribe({
            next: (response) => {
                this.loading = false;
                if (response.success) {
                    console.log('✅ Login exitoso');

                    if (response.data?.usuario?.requiereCambioPass) {
                        console.log('⚠️ El usuario debe cambiar su contraseña');
                    }

                    this.router.navigate(['/panel']);
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.loading = false;
                this.error = err?.message || 'Error al iniciar sesión';
                console.error('❌ Error login:', err);
                this.cdr.detectChanges();
            }
        });
    }
}
