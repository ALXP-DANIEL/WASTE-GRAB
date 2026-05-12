import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { ZardBadgeComponent } from '@/components/badge/badge.component';
import { ZardButtonComponent } from '@/components/button/button.component';
import { ZardCardComponent } from '@/components/card/card.component';
import { ZardInputDirective } from '@/components/input';
import { ZardFormFieldComponent, ZardFormLabelComponent, ZardFormControlComponent } from '@/components/form/form.component';
import { AuthService } from '@/services/auth.service';

type AuthMode = 'login' | 'register';

type LoginFormGroup = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;

type RegisterFormGroup = FormGroup<{
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  phone: FormControl<string>;
}>;

@Component({
  selector: 'app-auth-page',
  imports: [CommonModule, ReactiveFormsModule, ZardButtonComponent, ZardCardComponent, ZardInputDirective, ZardFormFieldComponent, ZardFormLabelComponent, ZardFormControlComponent, NgIcon],
  providers: [provideIcons({ lucideChevronLeft, lucideChevronRight })],
  templateUrl: './auth.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly mode = signal<AuthMode>('login');
  protected readonly isSubmitting = signal(false);
  protected readonly error = signal('');
  protected readonly currentSlide = signal(0);
  protected autoplayInterval: any = null;

  protected readonly slides = [
    {
      title: 'Reduce Waste',
      quote: 'Help reduce environmental impact by properly managing and recycling waste responsibly.',
      author: 'Eco Warrior',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Earn Rewards',
      quote: 'Get rewarded for your contribution to a cleaner planet and sustainable future.',
      author: 'Sustainability Lead',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Build Community',
      quote: 'Connect with others who care about sustainability and environmental change.',
      author: 'Community Manager',
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Make Impact',
      quote: 'Track your environmental impact and see the difference you make every day.',
      author: 'Impact Director',
      color: 'from-orange-500 to-red-600',
    },
  ];

  protected readonly loginForm: LoginFormGroup = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly registerForm: RegisterFormGroup = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    phone: new FormControl('', {
      nonNullable: true,
    }),
  });

  constructor() {
    effect(() => {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
      }
      this.startAutoplay();
    });
  }

  protected startAutoplay(): void {
    this.autoplayInterval = setInterval(() => {
      this.currentSlide.set((this.currentSlide() + 1) % this.slides.length);
    }, 5000);
  }

  protected stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  protected goToSlide(index: number): void {
    this.currentSlide.set(index);
  }

  protected nextSlide(): void {
    this.currentSlide.set((this.currentSlide() + 1) % this.slides.length);
  }

  protected prevSlide(): void {
    this.currentSlide.set((this.currentSlide() - 1 + this.slides.length) % this.slides.length);
  }

  protected switchMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.error.set('');
  }

  protected submitLogin(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: async () => {
        this.isSubmitting.set(false);
        await this.router.navigateByUrl('/todos');
      },
      error: () => {
        this.error.set('Could not sign in. Check your email and password.');
        this.isSubmitting.set(false);
      },
    });
  }

  protected submitRegister(): void {
    if (this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    this.authService.register(this.registerForm.getRawValue()).subscribe({
      next: async () => {
        this.isSubmitting.set(false);
        await this.router.navigateByUrl('/todos');
      },
      error: () => {
        this.error.set('Could not create your account.');
        this.isSubmitting.set(false);
      },
    });
  }
}
