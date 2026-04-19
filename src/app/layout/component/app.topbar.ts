import { LoginService } from './../../pages/service/login.service';
import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { AuthenticationService } from '@/pages/service/authentication.service';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-topbar',
  standalone: true,
  providers: [MessageService],
  imports: [
    RouterModule, CommonModule, StyleClassModule, DialogModule,
    PasswordModule, ButtonModule, FormsModule, MenuModule,
    ToastModule, PanelModule, Menu
  ],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');

    :host {
      --purple:        #9B8EC7;
      --purple-dark:   #7B6BAD;
      --purple-darker: #5a4d8a;
      --purple-light:  rgba(155,142,199,0.18);
      --purple-glow:   rgba(155,142,199,0.3);
      --amber:         #f1b434;
      --amber-light:   rgba(241,180,52,0.15);
      --bg:            #0e0b1a;
      --surface:       rgba(155,142,199,0.08);
      --border:        rgba(155,142,199,0.2);
      --border-bright: rgba(155,142,199,0.4);
      --text:          #f0f0ff;
      --text-muted:    rgba(220,215,255,0.55);
      --text-faint:    rgba(220,215,255,0.3);
      font-family: 'Outfit', sans-serif;
    }

    /* ── TOPBAR SHELL ── */
    .layout-topbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      background: linear-gradient(90deg, #0e0b1a 0%, #130e22 40%, #0f0c1e 100%);
      border-bottom: 1px solid var(--border);
      box-shadow:
        0 1px 0 rgba(155,142,199,0.12),
        0 4px 32px rgba(0,0,0,0.4);
      /* subtle inner top highlight */
      overflow: visible;
    }

    /* animated top accent line */
    .layout-topbar::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg,
        transparent 0%,
        var(--purple) 20%,
        var(--amber) 50%,
        var(--purple) 80%,
        transparent 100%
      );
      opacity: 0.7;
      animation: shimmer 4s ease-in-out infinite;
      background-size: 200% 100%;
    }

    @keyframes shimmer {
      0%   { background-position: -200% 0; opacity: 0.5; }
      50%  { opacity: 0.9; }
      100% { background-position: 200% 0; opacity: 0.5; }
    }

    /* ── LEFT ZONE ── */
    .left-zone {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Hamburger */
    .menu-btn {
      width: 34px; height: 34px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-muted);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .menu-btn:hover {
      border-color: var(--purple);
      background: var(--purple-light);
      color: var(--text);
      box-shadow: 0 0 12px var(--purple-glow);
    }
    .menu-btn i { font-size: 0.9rem; }

    /* Logo */
    .logo-wrap {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; user-select: none;
    }

    .logo-icon {
      width: 34px; height: 34px;
      border-radius: 9px;
      border: 1px solid rgba(155,142,199,0.45);
      background: linear-gradient(135deg, rgba(155,142,199,0.2) 0%, rgba(155,142,199,0.05) 100%);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }
    .logo-icon::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
    }
    .logo-icon svg { width: 18px; height: 18px; }

    .logo-text { display: flex; flex-direction: column; gap: 1px; }
    .logo-name {
      font-family: 'Syne', sans-serif;
      font-weight: 800; font-size: 1rem;
      color: var(--text); letter-spacing: -0.01em; line-height: 1;
    }
    .logo-sub {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.55rem; letter-spacing: 0.14em;
      text-transform: uppercase; color: var(--purple);
      opacity: 0.8;
    }

    /* Divider */
    .topbar-sep {
      width: 1px; height: 26px;
      background: linear-gradient(180deg, transparent, var(--border), transparent);
      flex-shrink: 0;
    }

    /* App tag */
    .app-tag {
      display: flex; align-items: center; gap: 6px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.65rem; letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .app-tag-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--amber);
      animation: blink 2.5s ease-in-out infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; box-shadow: 0 0 4px var(--amber); }
      50%       { opacity: 0.4; box-shadow: none; }
    }

    /* ── RIGHT ZONE ── */
    .right-zone {
      display: flex; align-items: center; gap: 10px;
    }

    /* User pill */
    .user-pill {
      display: flex; align-items: center; gap: 8px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 4px 12px 4px 4px;
      cursor: default;
      transition: border-color 0.2s;
    }
    .user-pill:hover {
      border-color: var(--border-bright);
    }

    .avatar {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--purple-dark) 0%, var(--purple-darker) 100%);
      color: #fff;
      font-family: 'Syne', sans-serif;
      font-weight: 700; font-size: 0.7rem;
      display: flex; align-items: center; justify-content: center;
      text-transform: uppercase;
      flex-shrink: 0;
      border: 1.5px solid rgba(155,142,199,0.5);
      letter-spacing: 0.02em;
    }

    /* Large avatar for profile dialog */
    .avatar.large {
      width: 72px; height: 72px;
      font-size: 1.8rem;
      border-width: 2px;
      flex-shrink: 0;
    }

    .user-name {
      font-size: 0.8rem; font-weight: 600;
      color: var(--text);
      max-width: 140px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    /* Role badge */
    .role-badge {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.58rem; letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--amber);
      background: var(--amber-light);
      border: 1px solid rgba(241,180,52,0.25);
      border-radius: 4px;
      padding: 2px 6px;
      white-space: nowrap;
    }

    /* Settings button */
    .settings-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-muted);
      font-family: 'Outfit', sans-serif;
      font-size: 0.78rem; font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .settings-btn:hover {
      border-color: var(--purple);
      background: var(--purple-light);
      color: var(--text);
      box-shadow: 0 0 14px var(--purple-glow);
    }
    .settings-btn i { font-size: 0.85rem; }

    /* ── PRIMENG MENU ── */
    :host ::ng-deep .p-menu {
      background: #130e22 !important;
      border: 1px solid var(--border) !important;
      border-radius: 14px !important;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(155,142,199,0.1) !important;
      padding: 8px !important;
      min-width: 200px !important;
      font-family: 'Outfit', sans-serif !important;
    }
    :host ::ng-deep .p-menu .p-submenu-header {
      font-family: 'IBM Plex Mono', monospace !important;
      font-size: 0.6rem !important;
      letter-spacing: 0.14em !important;
      text-transform: uppercase !important;
      color: var(--text-faint) !important;
      font-weight: 500 !important;
      padding: 8px 10px 4px !important;
      background: transparent !important;
    }
    :host ::ng-deep .p-menu .p-menuitem-link {
      border-radius: 8px !important;
      padding: 9px 10px !important;
      transition: background 0.15s !important;
      gap: 10px !important;
    }
    :host ::ng-deep .p-menu .p-menuitem-link:hover {
      background: var(--purple-light) !important;
    }
    :host ::ng-deep .p-menu .p-menuitem-link:hover .p-menuitem-text,
    :host ::ng-deep .p-menu .p-menuitem-link:hover .p-menuitem-icon {
      color: var(--text) !important;
    }
    :host ::ng-deep .p-menu .p-menuitem-icon {
      color: var(--text-muted) !important;
      font-size: 0.85rem !important;
    }
    :host ::ng-deep .p-menu .p-menuitem-text {
      font-size: 0.85rem !important;
      color: var(--text-muted) !important;
      font-weight: 500 !important;
    }
    :host ::ng-deep .p-menu .p-menuitem-separator {
      border-color: var(--border) !important;
      margin: 4px 0 !important;
    }

    /* ── TOAST ── */
    :host ::ng-deep .p-toast .p-toast-message {
      background: #130e22 !important;
      border: 1px solid var(--border) !important;
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
      font-family: 'Outfit', sans-serif !important;
    }
    :host ::ng-deep .p-toast .p-toast-message.p-toast-message-success {
      border-left: 3px solid #10b981 !important;
    }
    :host ::ng-deep .p-toast .p-toast-message.p-toast-message-error {
      border-left: 3px solid #ef4444 !important;
    }
    :host ::ng-deep .p-toast .p-toast-summary { color: var(--text) !important; font-weight: 600 !important; }
    :host ::ng-deep .p-toast .p-toast-detail  { color: var(--text-muted) !important; }

    /* ── DIALOG BASE ── */
    :host ::ng-deep .p-dialog {
      border: 1px solid var(--border) !important;
      border-radius: 18px !important;
      overflow: hidden !important;
      box-shadow: 0 32px 80px rgba(0,0,0,0.6) !important;
    }
    :host ::ng-deep .p-dialog .p-dialog-header {
      background: #130e22 !important;
      border-bottom: 1px solid var(--border) !important;
      padding: 1.2rem 1.5rem !important;
      font-family: 'Syne', sans-serif !important;
    }
    :host ::ng-deep .p-dialog .p-dialog-title {
      font-size: 1rem !important; font-weight: 700 !important;
      color: var(--text) !important;
      font-family: 'Syne', sans-serif !important;
    }
    :host ::ng-deep .p-dialog .p-dialog-header-icon {
      color: var(--text-muted) !important;
    }
    :host ::ng-deep .p-dialog .p-dialog-content {
      background: #0e0b1a !important;
      padding: 1.25rem 1.5rem !important;
      color: var(--text) !important;
    }
    :host ::ng-deep .p-dialog .p-dialog-footer {
      background: #130e22 !important;
      border-top: 1px solid var(--border) !important;
      padding: 1rem 1.5rem !important;
      display: flex !important;
      justify-content: flex-end !important;
      gap: 0.5rem !important;
    }

    /* ── CHANGE PASSWORD FORM ── */
    .cpw-form { display: flex; flex-direction: column; gap: 18px; }

    .cpw-field { display: flex; flex-direction: column; gap: 7px; }

    .cpw-label {
      display: flex; align-items: center; gap: 6px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.64rem; font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--text-muted);
    }
    .cpw-label svg { stroke: var(--purple); opacity: 0.8; }

    .cpw-input-wrap {
      position: relative;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--surface);
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      overflow: hidden;
    }
    .cpw-input-wrap:focus-within {
      border-color: var(--purple);
      box-shadow: 0 0 0 3px rgba(155,142,199,0.12);
      background: rgba(155,142,199,0.06);
    }

    .cpw-native-input {
      display: block; width: 100%; box-sizing: border-box;
      padding: 12px 44px 12px 14px;
      background: transparent; border: none; outline: none; box-shadow: none;
      color: var(--text);
      font-family: 'Outfit', sans-serif; font-size: 0.88rem; line-height: 1.4;
      -webkit-appearance: none; appearance: none;
    }
    .cpw-native-input::placeholder { color: var(--text-faint); }

    .cpw-eye-btn {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; padding: 0; cursor: pointer;
      color: var(--text-faint); display: flex; align-items: center;
      transition: color 0.15s;
    }
    .cpw-eye-btn:hover { color: var(--purple); }

    .cpw-error {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.71rem; color: #f87171; padding-left: 2px;
    }

    /* Dialog action buttons */
    .cpw-btn-cancel {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 18px; border-radius: 9px;
      border: 1px solid var(--border); background: var(--surface);
      color: var(--text-muted);
      font-family: 'Outfit', sans-serif; font-size: 0.84rem; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
    }
    .cpw-btn-cancel:hover { border-color: var(--border-bright); color: var(--text); }

    .cpw-btn-confirm {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 20px; border-radius: 9px; border: none;
      background: linear-gradient(135deg, var(--purple-dark) 0%, var(--purple) 100%);
      color: #fff;
      font-family: 'Outfit', sans-serif; font-size: 0.84rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 16px rgba(155,142,199,0.35);
    }
    .cpw-btn-confirm:hover:not([disabled]) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(155,142,199,0.5); }
    .cpw-btn-confirm:active:not([disabled]) { transform: translateY(0); }
    .cpw-btn-confirm[disabled] { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

    .cpw-spin { animation: cpw-rotate 0.7s linear infinite; }
    @keyframes cpw-rotate { to { transform: rotate(360deg); } }

    /* ── PROFILE CARD ── */
    .profile-card {
      display: flex; align-items: flex-start; gap: 24px;
      padding: 8px 0 4px;
    }
    .profile-info-block { flex: 1; }
    .profile-name {
      font-family: 'Syne', sans-serif;
      font-weight: 700; font-size: 1.4rem;
      color: var(--text); letter-spacing: -0.02em; margin-bottom: 16px;
    }
    .profile-grid { display: flex; flex-wrap: wrap; gap: 16px; }
    .profile-item { display: flex; flex-direction: column; gap: 3px; min-width: 120px; }
    .profile-item-label {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.6rem; text-transform: uppercase;
      letter-spacing: 0.12em; color: var(--text-faint); font-weight: 500;
    }
    .profile-item-value {
      font-size: 0.88rem; font-weight: 600; color: var(--text);
    }

    /* Logout dialog */
    .logout-body {
      display: flex; align-items: center; gap: 14px;
      padding: 8px 0;
    }
    .logout-icon-wrap {
      width: 40px; height: 40px; border-radius: 10px;
      background: rgba(248,113,113,0.12);
      border: 1px solid rgba(248,113,113,0.25);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .logout-body p {
      font-size: 0.88rem; color: var(--text-muted); line-height: 1.55;
    }
    .logout-body strong { color: var(--text); }

    /* ── RESPONSIVE ── */
    @media (max-width: 1024px) {
      .app-tag { display: none; }
      .topbar-sep { display: none; }
    }
    @media (max-width: 640px) {
      .layout-topbar { padding: 0 12px; }
      .logo-sub { display: none; }
      .user-name { display: none; }
      .role-badge { display: none; }
      .settings-btn span { display: none; }
      .settings-btn { padding: 7px 10px; }
    }
  `],
  template: `
    <p-toast />

    <div class="layout-topbar">

      <!-- LEFT -->
      <div class="left-zone">
        <button class="menu-btn" (click)="layoutService.onMenuToggle()" title="Toggle menu">
          <i class="pi pi-bars"></i>
        </button>

        <a class="logo-wrap" routerLink="/app">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9B8EC7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18L9 12L13 16L21 7"/>
              <path d="M16 7h5v5"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-name">Utilization Ratio</span>
          </div>
        </a>

        <div class="topbar-sep"></div>

        <div class="app-tag">
          <span class="app-tag-dot"></span>
          Live Dashboard
        </div>
      </div>

      <!-- RIGHT -->
      <div class="right-zone">

        <!-- User pill -->
        <div class="user-pill" *ngIf="userName">
          <div class="avatar" [title]="userName">{{ getUserInitials() }}</div>
          <span class="user-name">{{ userName }}</span>
          <span class="role-badge" *ngIf="userRole">{{ userRole }}</span>
        </div>

        <!-- Settings -->
        <p-menu #menu [model]="items" [popup]="true" appendTo="body" />
        <button type="button" class="settings-btn" (click)="menu.toggle($event)" title="Settings">
          <i class="pi pi-cog"></i>
          <span>Settings</span>
        </button>

      </div>
    </div>

    <!-- CHANGE PASSWORD DIALOG -->
    <p-dialog [(visible)]="changePasswordDialog" [style]="{width:'420px'}" header="Change Password" [modal]="true" appendTo="body">
      <ng-template pTemplate="content">
        <div class="cpw-form">

          <div class="cpw-field">
            <label class="cpw-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Old Password
            </label>
            <div class="cpw-input-wrap">
              <input class="cpw-native-input" [type]="showOldPw ? 'text' : 'password'" [(ngModel)]="old_password" placeholder="Enter old password" autocomplete="current-password" />
              <button type="button" class="cpw-eye-btn" (click)="showOldPw = !showOldPw" tabindex="-1">
                <svg *ngIf="!showOldPw" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg *ngIf="showOldPw"  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <div class="cpw-field">
            <label class="cpw-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              New Password
            </label>
            <div class="cpw-input-wrap">
              <input class="cpw-native-input" [type]="showNewPw ? 'text' : 'password'" [(ngModel)]="new_password" placeholder="Enter new password" autocomplete="new-password" />
              <button type="button" class="cpw-eye-btn" (click)="showNewPw = !showNewPw" tabindex="-1">
                <svg *ngIf="!showNewPw" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg *ngIf="showNewPw"  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <span class="cpw-error" *ngIf="new_password && !isPasswordValid()">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Must be 8+ chars with uppercase, lowercase, number &amp; special character.
            </span>
          </div>

          <div class="cpw-field">
            <label class="cpw-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Confirm Password
            </label>
            <div class="cpw-input-wrap">
              <input class="cpw-native-input" [type]="showConfirmPw ? 'text' : 'password'" [(ngModel)]="retype_password" placeholder="Confirm new password" autocomplete="new-password" />
              <button type="button" class="cpw-eye-btn" (click)="showConfirmPw = !showConfirmPw" tabindex="-1">
                <svg *ngIf="!showConfirmPw" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg *ngIf="showConfirmPw"  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <span class="cpw-error" *ngIf="retype_password && !doPasswordsMatch()">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Passwords do not match.
            </span>
          </div>

        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button type="button" class="cpw-btn-cancel" (click)="hideDialog()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Cancel
        </button>
        <button type="button" class="cpw-btn-confirm" [disabled]="!isFormValid() || loading" (click)="confirmChangePassword()">
          <svg *ngIf="!loading" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg *ngIf="loading" class="cpw-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          {{ loading ? 'Saving…' : 'Confirm' }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- LOGOUT DIALOG -->
    <p-dialog [(visible)]="logoutdialog" header="Confirm Logout" [modal]="true" [style]="{width:'400px'}" appendTo="body">
      <div class="logout-body">
        <div class="logout-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <p>Are you sure you want to <strong>sign out</strong>? You'll need to re-enter your credentials to access the dashboard.</p>
      </div>
      <ng-template pTemplate="footer">
        <button type="button" class="cpw-btn-cancel" (click)="hidelogout()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Cancel
        </button>
        <button type="button" (click)="logout()" style="display:inline-flex;align-items:center;gap:7px;padding:9px 20px;border-radius:9px;border:none;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;font-family:'Outfit',sans-serif;font-size:0.84rem;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(239,68,68,0.3);">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Yes, Sign Out
        </button>
      </ng-template>
    </p-dialog>

    <!-- PROFILE DIALOG -->
    <p-dialog [(visible)]="profiledialog" header="My Profile" [modal]="true" [maximizable]="true" [resizable]="true" [style]="{width:'560px'}" appendTo="body">
      <ng-template pTemplate="content">
        <div class="profile-card">
          <div class="avatar large">{{ getUserInitials() }}</div>
          <div class="profile-info-block">
            <h2 class="profile-name">{{ userName }}</h2>
            <div class="profile-grid">
              <div class="profile-item">
                <span class="profile-item-label">Employee ID</span>
                <span class="profile-item-value">{{ userYashId }}</span>
              </div>
              <div class="profile-item">
                <span class="profile-item-label">Email</span>
                <span class="profile-item-value">{{ userEmail }}</span>
              </div>
              <div class="profile-item">
                <span class="profile-item-label">Business Unit</span>
                <span class="profile-item-value">{{ userBusinessUnit }}</span>
              </div>
              <div class="profile-item">
                <span class="profile-item-label">Role</span>
                <span class="profile-item-value" style="text-transform:capitalize">{{ userRole }}</span>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </p-dialog>
  `
})
export class AppTopbar implements OnInit {
  old_password: string = '';
  new_password: string = '';
  retype_password: string = '';
  changePasswordDialog: boolean = false;
  showOldPw: boolean = false;
  showNewPw: boolean = false;
  showConfirmPw: boolean = false;
  profiledialog: boolean = false;
  logoutdialog: boolean = false;
  loading: boolean = false;

  items: MenuItem[] | undefined;
  userName: string = '';
  userEmail: string = '';
  userYashId: string = '';
  userBusinessUnit: string = '';
  userRole: string = '';

  constructor(
    public layoutService: LayoutService,
    public messageservice: MessageService,
    private authservice: AuthenticationService,
    private loginservice: LoginService
  ) {}

  ngOnInit(): void {
    const darkTheme = JSON.parse(localStorage.getItem('darkTheme') ?? 'false') as boolean;
    this.layoutService.layoutConfig.update((state: any) => ({ ...state, darkTheme }));
    this.initializeMenuItems(darkTheme);
    this.loadUserDetails();
  }

  initializeMenuItems(isDarkMode: boolean) {
    this.items = [
      {
        label: 'Account',
        items: [
          { label: 'Profile',         icon: 'pi pi-user',     command: () => this.openprofile() },
          { separator: true },
          { label: 'Change Password', icon: 'pi pi-key',      command: () => this.changeUser_Password() },
          { label: 'Sign Out',        icon: 'pi pi-sign-out', command: () => this.togglelogout() }
        ]
      }
    ];
  }

  loadUserDetails() {
    // First, immediately populate from localStorage so the name shows instantly
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        this.userName         = user.employee_name        || '';
        this.userEmail        = user.email                || '';
        this.userYashId       = user.employee_id          || '';
        this.userBusinessUnit = user.parent_business_unit || '';
        this.userRole         = user.type                 || '';
      } catch {}
    }

    // Then refresh from API to keep data fresh
    this.loginservice.getUserDetails().subscribe({
      next: (user: any) => {
        this.userName         = user.name        || this.userName        || 'Unknown User';
        this.userEmail        = user.email                || this.userEmail       || 'No Email';
        this.userYashId       = user.yash_id          || this.userYashId      || 'No Id';
        this.userBusinessUnit = user.buh || this.userBusinessUnit|| 'N/A';
        this.userRole         = user.type                 || this.userRole        || 'N/A';
        // Keep localStorage in sync
        localStorage.setItem('user', JSON.stringify(user));
        const currentDarkTheme = Boolean(this.layoutService.layoutConfig()?.darkTheme ?? false);
        this.initializeMenuItems(currentDarkTheme);
      },
      error: () => {
        // API failed — keep whatever we loaded from localStorage, or fallback
        if (!this.userName) this.userName = 'Unknown User';
        if (!this.userEmail) this.userEmail = 'No Email';
        if (!this.userYashId) this.userYashId = 'No Id';
        if (!this.userBusinessUnit) this.userBusinessUnit = 'N/A';
        if (!this.userRole) this.userRole = 'N/A';
      }
    });
  }

  getUserInitials(): string {
    if (!this.userName) return '?';
    const words = this.userName.trim().split(' ');
    return (words[0]?.charAt(0) || '?').toUpperCase() +
           (words.length > 1 ? words[1].charAt(0).toUpperCase() : '');
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => {
      const newDarkTheme = !state.darkTheme;
      localStorage.setItem('darkTheme', JSON.stringify(newDarkTheme));
      this.initializeMenuItems(newDarkTheme);
      return { ...state, darkTheme: newDarkTheme };
    });
  }

  openprofile()         { this.profiledialog = true; }
  changeUser_Password() { this.changePasswordDialog = true; }
  togglelogout()        { this.logoutdialog = true; }
  hidelogout()          { this.logoutdialog = false; }

  isPasswordValid(): boolean {
    const p = this.new_password;
    return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[!@#$%^&*(),.?":{}|<>]/.test(p);
  }
  doPasswordsMatch(): boolean { return this.new_password === this.retype_password; }
  isFormValid(): boolean { return this.old_password.length > 0 && this.isPasswordValid() && this.doPasswordsMatch(); }

  hideDialog() {
    this.changePasswordDialog = false;
    this.old_password = this.new_password = this.retype_password = '';
    this.loading = this.showOldPw = this.showNewPw = this.showConfirmPw = false;
  }

  confirmChangePassword() {
    if (this.isFormValid()) {
      this.loading = true;
      this.loginservice.changePassword(this.old_password, this.new_password).subscribe({
        next: () => {
          this.messageservice.add({ severity: 'success', summary: 'Password Updated', detail: 'Your password has been changed successfully.' });
          this.hideDialog();
        },
        error: () => {
          this.messageservice.add({ severity: 'error', summary: 'Update Failed', detail: 'Failed to change password. Please try again.' });
          this.loading = false;
        }
      });
    }
  }

  logout() {
    this.authservice.logout();
    ['CurrentPage','ApprovalCurrentPage','LHistoryCurrentPage','PendingCurrentPage','RejectedCurrentPage','UnApprovedCurrentPage']
      .forEach(k => localStorage.removeItem(k));
    this.hidelogout();
  }
}