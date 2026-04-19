import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { AuthenticationService } from '../service/authentication.service';
import { LoginService } from '../service/login.service';
import { LayoutService } from '@/layout/service/layout.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule, CheckboxModule, InputTextModule, CommonModule, ToastModule, FormsModule, RouterModule, RippleModule],
  providers: [MessageService],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');

    :host { display: block; font-family: 'Outfit', sans-serif; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 420px;
      background: #4D2B8C;
      overflow: hidden;
      position: relative;
    }

    .grid-bg {
      position: fixed; inset: 0;
      background-image:
        linear-gradient(rgba(241,180,52,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(241,180,52,0.04) 1px, transparent 1px);
      background-size: 48px 48px;
      z-index: 0;
      animation: gridShift 20s linear infinite;
    }
    @keyframes gridShift { 0% { background-position: 0 0; } 100% { background-position: 48px 48px; } }

    .glow { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(90px); }
    .glow-1 {
      width: 600px; height: 400px;
      background: radial-gradient(ellipse, rgba(241,180,52,0.12) 0%, transparent 70%);
      top: -80px; left: 5%;
      animation: breathe 8s ease-in-out infinite alternate;
    }
    .glow-2 {
      width: 400px; height: 400px;
      background: radial-gradient(ellipse, rgba(56,139,253,0.08) 0%, transparent 70%);
      bottom: 5%; right: 30%;
      animation: breathe 11s ease-in-out infinite alternate-reverse;
    }
    @keyframes breathe { from { opacity: 0.6; transform: scale(1); } to { opacity: 1; transform: scale(1.15); } }

    .scanline {
      position: fixed; inset: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px);
      z-index: 0; pointer-events: none;
    }

    /* LEFT PANEL */
    .left-panel {
      position: relative; z-index: 1;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 52px 60px;
      border-right: 1px solid rgba(241,180,52,0.08);
    }

    .logo { display: flex; align-items: center; gap: 14px; }
    .logo-icon {
      width: 42px; height: 42px;
      border: 1.5px solid rgba(241,180,52,0.6);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
    }
    .logo-icon::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(241,180,52,0.15) 0%, transparent 60%);
    }
    .logo-icon svg { width: 22px; height: 22px; }
    .logo-text { display: flex; flex-direction: column; gap: 1px; }
    .logo-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.15rem; color: #f0f4ff; letter-spacing: -0.01em; line-height: 1; }
    .logo-sub { font-family: 'IBM Plex Mono', monospace; font-size: 0.62rem; color: rgba(241,180,52,0.7); letter-spacing: 0.12em; text-transform: uppercase; }

    .hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 40px 0; max-width: 580px; }

    .hero-tag {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem;
      color: rgba(241,180,52,0.8); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 24px;
    }
    .hero-tag-dot {
      width: 6px; height: 6px; background: #f1b434; border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(241,180,52,0.5); } 50% { box-shadow: 0 0 0 6px rgba(241,180,52,0); } }

    .hero-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(2.8rem, 4vw, 4.2rem); color: #f0f4ff; line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 20px; }
    .hero-title .accent { color: #f1b434; position: relative; display: inline-block; }
    .hero-title .accent::after { content: ''; position: absolute; bottom: 4px; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #f1b434, transparent); border-radius: 2px; }

    .hero-desc { font-size: 1rem; color: rgba(180,195,220,0.7); line-height: 1.75; max-width: 440px; font-weight: 300; margin-bottom: 44px; }

    .stats { display: flex; gap: 40px; }
    .stat { display: flex; flex-direction: column; gap: 4px; position: relative; padding-left: 18px; }
    .stat::before { content: ''; position: absolute; left: 0; top: 4px; bottom: 4px; width: 2px; background: linear-gradient(180deg, #f1b434, rgba(241,180,52,0.1)); border-radius: 2px; }
    .stat-val { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.7rem; color: #f0f4ff; letter-spacing: -0.03em; line-height: 1; }
    .stat-label { font-family: 'IBM Plex Mono', monospace; font-size: 0.65rem; color: rgba(180,195,220,0.5); text-transform: uppercase; letter-spacing: 0.1em; }

    .bottom-bar { display: flex; align-items: center; gap: 24px; }
    .badge { display: flex; align-items: center; gap: 7px; font-size: 0.75rem; color: rgba(180,195,220,0.45); }
    .badge svg { width: 13px; height: 13px; stroke: rgba(241,180,52,0.5); fill: none; stroke-width: 1.8; flex-shrink: 0; }
    .sep { width: 1px; height: 16px; background: rgba(255,255,255,0.08); }

    /* RIGHT PANEL */
    .right-panel {
      position: relative; z-index: 1;
      background: rgba(10,16,26,0.95);
      border-left: 1px solid rgba(241,180,52,0.1);
      display: flex; flex-direction: column; justify-content: center;
      padding: 56px 44px;
      backdrop-filter: blur(12px);
    }
    .right-panel::before, .right-panel::after { content: ''; position: absolute; width: 32px; height: 32px; pointer-events: none; }
    .right-panel::before { top: 28px; right: 28px; border-top: 1.5px solid rgba(241,180,52,0.4); border-right: 1.5px solid rgba(241,180,52,0.4); }
    .right-panel::after { bottom: 28px; left: 28px; border-bottom: 1.5px solid rgba(241,180,52,0.4); border-left: 1.5px solid rgba(241,180,52,0.4); }

    .form-header { margin-bottom: 36px; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
    .form-eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(241,180,52,0.75); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
    .form-eyebrow::before { content: ''; display: inline-block; width: 20px; height: 1px; background: rgba(241,180,52,0.5); }
    .form-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.85rem; color: #f0f4ff; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 8px; }
    .form-sub { font-size: 0.82rem; color: rgba(180,195,220,0.45); font-weight: 300; }

    .field { margin-bottom: 18px; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
    .field:nth-child(1) { animation-delay: 0.05s; }
    .field:nth-child(2) { animation-delay: 0.1s; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

    .field-label { display: flex; align-items: center; gap: 6px; font-family: 'IBM Plex Mono', monospace; font-size: 0.67rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(180,195,220,0.55); margin-bottom: 9px; }
    .field-label-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(241,180,52,0.5); }
    .field-wrap { position: relative; }
    .field-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; stroke: rgba(241,180,52,0.4); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; transition: stroke 0.2s; z-index: 1; }
    .custom-input { width: 100%; padding: 13px 16px 13px 44px; background: rgba(255,255,255,0.03); border: 1px solid rgba(241,180,52,0.12); border-radius: 10px; font-size: 0.88rem; font-family: 'Outfit', sans-serif; color: #e8eeff; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; box-sizing: border-box; letter-spacing: 0.01em; }
    .custom-input::placeholder { color: rgba(180,195,220,0.2); }
    .custom-input:focus { border-color: rgba(241,180,52,0.45); background: rgba(241,180,52,0.04); box-shadow: 0 0 0 3px rgba(241,180,52,0.07), inset 0 0 0 1px rgba(241,180,52,0.1); }
    .field-wrap:focus-within .field-icon { stroke: rgba(241,180,52,0.75); }

    .pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 6px; color: rgba(180,195,220,0.35); display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: color 0.2s, background 0.15s; }
    .pw-toggle:hover { color: rgba(241,180,52,0.7); background: rgba(241,180,52,0.07); }
    .pw-toggle svg { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

    .btn-signin { width: 100%; padding: 14px; background: linear-gradient(135deg, #c4921a 0%, #f1b434 50%, #e8a820 100%); color: #0a0f1a; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; letter-spacing: 0.04em; text-transform: uppercase; transition: transform 0.15s, box-shadow 0.15s, filter 0.15s, opacity 0.15s; box-shadow: 0 4px 24px rgba(241,180,52,0.25), 0 1px 4px rgba(0,0,0,0.3); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 8px; animation: fadeUp 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
    .btn-signin::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent); transition: left 0.5s; }
    .btn-signin:hover:not(:disabled)::before { left: 100%; }
    .btn-signin:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(241,180,52,0.4); }
    .btn-signin:active:not(:disabled) { transform: translateY(0); }
    .btn-signin:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-arrow { width: 16px; height: 16px; stroke: #0a0f1a; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.2s; }
    .btn-signin:hover .btn-arrow { transform: translateX(3px); }

    .spin-icon { width: 17px; height: 17px; border: 2px solid rgba(10,15,26,0.3); border-top-color: #0a0f1a; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .divider { display: flex; align-items: center; gap: 14px; margin: 22px 0 0; animation: fadeUp 0.5s 0.25s cubic-bezier(0.16,1,0.3,1) both; }
    .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
    .divider-text { font-family: 'IBM Plex Mono', monospace; font-size: 0.64rem; color: rgba(180,195,220,0.25); letter-spacing: 0.08em; }

    .form-footer { margin-top: 28px; padding-top: 22px; border-top: 1px solid rgba(255,255,255,0.05); animation: fadeUp 0.5s 0.3s cubic-bezier(0.16,1,0.3,1) both; }
    .footer-info { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: rgba(180,195,220,0.3); line-height: 1.55; }
    .footer-info svg { width: 13px; height: 13px; stroke: rgba(241,180,52,0.35); fill: none; stroke-width: 1.8; flex-shrink: 0; }
    .footer-link { color: rgba(241,180,52,0.6); font-weight: 500; cursor: pointer; background: none; border: none; padding: 0; font-family: inherit; font-size: inherit; transition: color 0.2s; }
    .footer-link:hover { color: #f1b434; }

    @media (max-width: 900px) {
      .page { grid-template-columns: 1fr; }
      .left-panel { display: none; }
      .right-panel { min-height: 100vh; border-left: none; padding: 36px 28px; }
    }
  `],
  template: `
    <p-toast position="top-right" />

    <div class="grid-bg"></div>
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>
    <div class="scanline"></div>

    <div class="page">

      <!-- LEFT PANEL -->
      <div class="left-panel">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f1b434" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18L9 12L13 16L21 7"/>
              <path d="M16 7h5v5"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-name">Utilization Ratio</span>
          
          </div>
        </div>

        <div class="hero">
          <div class="hero-tag">
            <span class="hero-tag-dot"></span>
            
          </div>
          <h1 class="hero-title">
            Track. Optimize.<br/>
            <span class="accent">Maximize</span><br/>
            Performance.
          </h1>
          <p class="hero-desc">
            Real-time visibility into team utilization, project allocation,
            and capacity — so you can make decisions backed by data.
          </p>
          
        </div>

        <div class="bottom-bar">
          
          <div class="sep"></div>
          <div class="badge">
            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Internal Network
          </div>
          <div class="sep"></div>
          <div class="badge">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Updated Daily
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <div class="right-panel">
        <div class="form-header">
          <div class="form-eyebrow">Secure Access</div>
          <div class="form-title">Sign In</div>
          <div class="form-sub">Enter your Employee ID to continue</div>
        </div>

        <div class="field">
          <label class="field-label" for="emp-id">
            <span class="field-label-dot"></span>
            Employee ID
          </label>
          <div class="field-wrap">
            <svg class="field-icon" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              class="custom-input"
              id="emp-id"
              type="text"
              placeholder="e.g. 1100031"
              [(ngModel)]="yash_id"
              (keydown.enter)="login()"
              autocomplete="username"
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="password">
            <span class="field-label-dot"></span>
            Password
          </label>
          <div class="field-wrap">
            <svg class="field-icon" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              class="custom-input"
              id="password"
              [type]="passwordVisible ? 'text' : 'password'"
              placeholder="••••••••••"
              [(ngModel)]="password"
              (keydown.enter)="login()"
              autocomplete="current-password"
            />
            <button type="button" class="pw-toggle" (click)="togglePasswordVisibility()" [attr.aria-label]="passwordVisible ? 'Hide password' : 'Show password'">
              <svg viewBox="0 0 24 24" *ngIf="!passwordVisible">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg viewBox="0 0 24 24" *ngIf="passwordVisible">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <button type="button" class="btn-signin" (click)="login()" [disabled]="isLoading">
          <div class="spin-icon" *ngIf="isLoading"></div>
          <ng-container *ngIf="!isLoading">
            <span>Access Dashboard</span>
            <svg class="btn-arrow" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </ng-container>
          <span *ngIf="isLoading">Authenticating...</span>
        </button>

        <div class="divider">
          <div class="divider-line"></div>
          <span class="divider-text">YASH TECHNOLOGIES</span>
          <div class="divider-line"></div>
        </div>

        <div class="form-footer">
          <div class="footer-info">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Don't have access? <button class="footer-link">Contact your administrator</button></span>
          </div>
        </div>
      </div>

    </div>
  `
})
export class Login {
  yash_id: string = '';
  password: string = '';
  passwordVisible: boolean = false;
  isLoading: boolean = false;

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    public loginservice: LoginService,
    public auth: AuthenticationService,
    public messageservice: MessageService
  ) {}

  login() {
    if (!this.yash_id || !this.password) {
      this.messageservice.add({ severity: 'warn', summary: 'Missing Fields', detail: 'Please enter your Employee ID and password.' });
      return;
    }
    this.isLoading = true;
    this.loginservice.getToken(this.yash_id, this.password).subscribe(
      (data: any) => {
        this.auth.tokenValue = data;
        this.getuser();
        localStorage.setItem('token', JSON.stringify(data));
        this.messageservice.add({ severity: 'success', summary: 'Access Granted', detail: `Welcome back, ${this.yash_id}!` });
      },
      (err: any) => {
        this.isLoading = false;
        this.messageservice.add({ severity: 'error', summary: 'Authentication Failed', detail: 'Invalid credentials. Please contact your administrator.' });
      }
    );
  }

  getuser() {
    this.loginservice.getUserDetails().subscribe((data: any) => {
      this.isLoading = false;
      this.auth.userValue = data;
      localStorage.setItem('user', JSON.stringify(data));
      if (data?.type == 'Superadmin') {
        this.router.navigate(['/app']);
      } else if (data?.type == 'manager') {
        this.router.navigate(['/app/pages/team']);
      }
      else{
        this.router.navigate(['/app/pages/timesheet']);
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}