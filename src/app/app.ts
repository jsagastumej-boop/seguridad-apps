import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  age: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <!-- Login View -->
    <div *ngIf="!isLoggedIn" class="container">
      <div class="login-card">
        <h1>🔐 Login</h1>
        <p class="subtitle">Usa: emilys / emilyspass</p>
        
        <form (ngSubmit)="login()">
          <div class="form-group">
            <label>Username</label>
            <input 
              type="text" 
              [(ngModel)]="username" 
              name="username"
              placeholder="emilys"
              required>
          </div>
          
          <div class="form-group">
            <label>Password</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password"
              placeholder="emilyspass"
              required>
          </div>
          
          <button type="submit" [disabled]="loading">
            {{ loading ? 'Cargando...' : 'Ingresar' }}
          </button>
          
          <div *ngIf="errorMessage" class="error">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>

    <!-- Home View -->
    <div *ngIf="isLoggedIn" class="container">
      <div class="home-card">
        <div class="header">
          <div>
            <h1>👋 Bienvenido, {{ userName }}</h1>
            <p class="user-email">{{ userEmail }}</p>
          </div>
          <button (click)="logout()" class="logout-btn">Cerrar Sesión</button>
        </div>
        
        <p class="token-info">Token: {{ token?.substring(0, 30) }}...</p>
        
        <div class="tabs">
          <button 
            [class.active]="activeTab === 'users'" 
            (click)="activeTab = 'users'; loadUsers()">
            👥 Usuarios
          </button>
          <button 
            [class.active]="activeTab === 'products'" 
            (click)="activeTab = 'products'; loadProducts()">
            🛍️ Productos
          </button>
        </div>

        <!-- Users Tab -->
        <div *ngIf="activeTab === 'users'" class="content-section">
          <div class="section-header">
            <h2>📋 Lista de Usuarios</h2>
            <button (click)="loadUsers()" [disabled]="loading" class="refresh-btn">
              {{ loading ? '⏳' : '🔄' }} Recargar
            </button>
          </div>
          
          <div *ngIf="users.length > 0" class="users-grid">
            <div *ngFor="let user of users" class="user-card">
              <img [src]="user.image" [alt]="user.firstName">
              <h3>{{ user.firstName }} {{ user.lastName }}</h3>
              <p>{{ user.email }}</p>
              <span class="age">{{ user.age }} años</span>
            </div>
          </div>
        </div>

        <!-- Products Tab -->
        <div *ngIf="activeTab === 'products'" class="content-section">
          <div class="section-header">
            <h2>🛍️ Productos Disponibles</h2>
            <button (click)="loadProducts()" [disabled]="loading" class="refresh-btn">
              {{ loading ? '⏳' : '🔄' }} Recargar
            </button>
          </div>
          
          <div *ngIf="products.length > 0" class="products-grid">
            <div *ngFor="let product of products" class="product-card">
              <img [src]="product.thumbnail" [alt]="product.title">
              <div class="product-info">
                <h3>{{ product.title }}</h3>
                <p class="category">{{ product.category }}</p>
                <p class="price">\${{ product.price }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .login-card, .home-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 100%;
    }

    .home-card {
      max-width: 1100px;
    }

    h1 {
      color: #333;
      margin-bottom: 5px;
      font-size: 28px;
    }

    .user-email {
      color: #666;
      font-size: 14px;
      margin-bottom: 15px;
    }

    .subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #555;
      margin-bottom: 8px;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    button {
      padding: 14px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-card button {
      width: 100%;
    }

    .error {
      margin-top: 15px;
      padding: 12px;
      background: #fee;
      color: #c33;
      border-radius: 8px;
      font-size: 14px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .logout-btn {
      background: #dc3545;
      font-size: 14px;
    }

    .logout-btn:hover {
      box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
    }

    .token-info {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 8px;
      font-size: 12px;
      color: #666;
      margin-bottom: 20px;
      word-break: break-all;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .tabs button {
      flex: 1;
      background: #e9ecef;
      color: #495057;
    }

    .tabs button.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      color: #333;
      font-size: 22px;
    }

    .refresh-btn {
      background: #28a745;
      font-size: 14px;
    }

    .refresh-btn:hover:not(:disabled) {
      box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 20px;
    }

    .user-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      transition: transform 0.2s;
    }

    .user-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .user-card img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin-bottom: 10px;
      object-fit: cover;
    }

    .user-card h3 {
      color: #333;
      font-size: 16px;
      margin-bottom: 5px;
    }

    .user-card p {
      color: #666;
      font-size: 13px;
      margin-bottom: 8px;
    }

    .age {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      display: inline-block;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .product-card {
      background: #f8f9fa;
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .product-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .product-info {
      padding: 15px;
    }

    .product-info h3 {
      color: #333;
      font-size: 16px;
      margin-bottom: 8px;
    }

    .category {
      color: #666;
      font-size: 13px;
      margin-bottom: 10px;
      text-transform: capitalize;
    }

    .price {
      color: #28a745;
      font-size: 20px;
      font-weight: bold;
    }
  `]
})
export class App implements OnInit {
  username = 'emilys';
  password = 'emilyspass';
  isLoggedIn = false;
  token: string | null = null;
  userName = '';
  userEmail = '';
  loading = false;
  errorMessage = '';
  users: User[] = [];
  products: Product[] = [];
  activeTab = 'users';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Verificar que estamos en el navegador
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('userName');
      const savedEmail = localStorage.getItem('userEmail');
      
      if (savedToken && savedUser) {
        this.token = savedToken;
        this.userName = savedUser;
        this.userEmail = savedEmail || '';
        this.isLoggedIn = true;
        this.loadUsers();
      }
    }
  }

  login() {
    this.loading = true;
    this.errorMessage = '';

    this.http.post<any>('https://dummyjson.com/auth/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.token = response.accessToken;
        this.userName = `${response.firstName} ${response.lastName}`;
        this.userEmail = response.email;
        this.isLoggedIn = true;
        
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('authToken', response.accessToken);
          localStorage.setItem('userName', this.userName);
          localStorage.setItem('userEmail', this.userEmail);
        }
        
        this.loading = false;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.errorMessage = 'Error al iniciar sesión. Verifica usuario y contraseña.';
        this.loading = false;
      }
    });
  }

  loadUsers() {
    if (this.users.length > 0) return;
    
    this.loading = true;
    
    this.http.get<{ users: User[] }>('https://dummyjson.com/users?limit=8')
      .subscribe({
        next: (response) => {
          this.users = response.users;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar usuarios', error);
          this.loading = false;
        }
      });
  }

  loadProducts() {
    if (this.products.length > 0) return;
    
    this.loading = true;
    
    this.http.get<{ products: Product[] }>('https://dummyjson.com/products?limit=12')
      .subscribe({
        next: (response) => {
          this.products = response.products;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar productos', error);
          this.loading = false;
        }
      });
  }

  logout() {
    this.isLoggedIn = false;
    this.token = null;
    this.userName = '';
    this.userEmail = '';
    this.users = [];
    this.products = [];
    this.password = '';
    this.activeTab = 'users';
    
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  }
}