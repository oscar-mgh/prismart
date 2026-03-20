import { Email } from 'src/modules/auth/domain/value-objects/email.vo';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SALES_ADMIN = 'SALES_ADMIN',
  SUPPORT = 'SUPPORT',
  CUSTOMER = 'CUSTOMER',
}

export class User {
  constructor(
    public readonly id: Id,
    private username: string,
    private email: Email,
    private password: string,
    private role: UserRole = UserRole.CUSTOMER,
    private active: boolean = true,
    public storeId?: Id,
  ) {
    if (this.username.length < 4 || this.username.length > 40) throw new Error('Invalid username');
  }

  public getStoreId(): Id | undefined {
    return this.storeId;
  }
  public getUsername(): string {
    return this.username;
  }
  public getEmail(): Email {
    return this.email;
  }
  public getPassword(): string {
    return this.password;
  }
  public getRole(): UserRole {
    return this.role;
  }
  public isActive(): boolean {
    return this.active;
  }
  public activate() {
    this.active = true;
  }
  public deactivate() {
    this.active = false;
  }

  public assignStore(storeId: Id): void {
    if (this.role === UserRole.SUPER_ADMIN || this.role === UserRole.SUPPORT) {
      return;
    }

    if (this.storeId) {
      throw new Error('User already has a store assigned');
    }
    this.storeId = storeId;
    this.role = UserRole.SALES_ADMIN;
  }

  public promoteToSalesAdmin(): void {
    if (this.role === UserRole.SUPER_ADMIN) {
      return;
    }
    this.role = UserRole.SALES_ADMIN;
  }
}
