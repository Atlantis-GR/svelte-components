import { UserManager, User, type UserManagerSettings } from 'oidc-client-ts';
import type { AuthSettings, SignInRedirectOptions, UserProfile } from './types.js';
import { defaultAuthSettings } from './types.js';
import { createScopedLogger, type ILogger } from './logger.js';

/**
 * Core authentication service wrapping oidc-client-ts
 */
export class AuthService {
  private userManager: UserManager;
  private currentUser: User | null = null;
  private userCallbacks: Array<(user: User | null) => void> = [];
  private errorCallbacks: Array<(error: Error) => void> = [];
  private logger: ILogger;

  constructor(authSettings: AuthSettings) {
    // Initialize logger
    this.logger = createScopedLogger('AuthService');
    
    this.logger.info('Initializing AuthService with settings', { authority: authSettings.authority, client_id: authSettings.client_id });
    
    // Merge with defaults
    const settings: UserManagerSettings = {
      ...defaultAuthSettings,
      ...authSettings,
      authority: authSettings.authority,
      client_id: authSettings.client_id,
      redirect_uri: authSettings.redirect_uri,
      post_logout_redirect_uri: authSettings.post_logout_redirect_uri,
      response_type: authSettings.response_type || 'code',
      scope: authSettings.scope || 'openid profile email'
    };

    this.userManager = new UserManager(settings);
    this.setupEventListeners();
    this.init();
  }

  /**
   * Initialize the service by loading the current user
   */
  private async init(): Promise<void> {
    try {
      this.logger.debug('Loading current user from storage');
      const user = await this.userManager.getUser();
      if (user && !user.expired) {
        this.logger.info('User loaded successfully', { userId: user.profile.sub, name: user.profile.name });
        this.currentUser = user;
        this.notifyUserChange(user);
      } else {
        this.logger.debug('No valid user found in storage');
      }
    } catch (error) {
      this.logger.error('Error loading user', error);
      this.notifyError(error as Error);
    }
  }

  /**
   * Set up event listeners for the UserManager
   */
  private setupEventListeners(): void {
    // User loaded event
    this.userManager.events.addUserLoaded((user: User) => {
      this.logger.info('User loaded', { userId: user.profile.sub, name: user.profile.name });
      this.currentUser = user;
      this.notifyUserChange(user);
    });

    // User unloaded event
    this.userManager.events.addUserUnloaded(() => {
      this.logger.info('User unloaded');
      this.currentUser = null;
      this.notifyUserChange(null);
    });

    // Access token expiring event
    this.userManager.events.addAccessTokenExpiring(() => {
      this.logger.info('Access token expiring - automatic renewal will occur if enabled');
    });

    // Access token expired event
    this.userManager.events.addAccessTokenExpired(() => {
      this.logger.warn('Access token expired');
      this.currentUser = null;
      this.notifyUserChange(null);
    });

    // Silent renew error event
    this.userManager.events.addSilentRenewError((error: Error) => {
      this.logger.error('Silent renew error', error);
      this.notifyError(error);
    });

    // User signed out event
    this.userManager.events.addUserSignedOut(() => {
      this.logger.info('User signed out');
      this.userManager.clearStaleState();
      this.currentUser = null;
      this.notifyUserChange(null);
    });
  }

  /**
   * Subscribe to user changes
   */
  public onUserChange(callback: (user: User | null) => void): () => void {
    this.userCallbacks.push(callback);
    // Immediately call with current user
    callback(this.currentUser);
    // Return unsubscribe function
    return () => {
      this.userCallbacks = this.userCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to errors
   */
  public onError(callback: (error: Error) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyUserChange(user: User | null): void {
    this.userCallbacks.forEach(callback => callback(user));
  }

  private notifyError(error: Error): void {
    this.errorCallbacks.forEach(callback => callback(error));
  }

  /**
   * Load the current user from storage
   */
  public async loadUser(): Promise<User | null> {
    try {
      this.logger.debug('Loading user from storage');
      const user = await this.userManager.getUser();
      if (user && !user.expired) {
        this.logger.info('User loaded successfully', { userId: user.profile.sub });
        this.currentUser = user;
        this.notifyUserChange(user);
        return user;
      }
      this.logger.debug('No valid user found');
      return null;
    } catch (error) {
      this.logger.error('Error loading user', error);
      return null;
    }
  }

  /**
   * Check if user is currently logged in
   */
  public async isLoggedIn(): Promise<boolean> {
    const user = await this.userManager.getUser();
    return user !== null && !user.expired;
  }

  /**
   * Get the current user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get user profile from ID token
   */
  public getUserProfile(): UserProfile | null {
    return this.currentUser?.profile as UserProfile || null;
  }

  /**
   * Get user's email
   */
  public getEmail(): string | undefined {
    return this.getUserProfile()?.email;
  }

  /**
   * Check if user has verified email
   */
  public hasVerifiedEmail(): boolean {
    return this.getUserProfile()?.email_verified === true;
  }

  /**
   * Get user's subject ID
   */
  public getSubjectId(): string | undefined {
    return this.getUserProfile()?.sub;
  }

  /**
   * Get user's full name
   */
  public getFullName(): string | undefined {
    const profile = this.getUserProfile();
    if (profile?.given_name && profile?.family_name) {
      return `${profile.given_name} ${profile.family_name}`;
    }
    return undefined;
  }

  /**
   * Get user's username
   */
  public getUserName(): string | undefined {
    return this.getUserProfile()?.name;
  }

  /**
   * Get display name (tries full name, then email, then username)
   */
  public getDisplayName(): string {
    return this.getFullName() || this.getEmail() || this.getUserName() || '';
  }

  /**
   * Check if user is an admin
   */
  public isAdmin(): boolean {
    const profile = this.getUserProfile();
    if (!profile) return false;
    
    // Check for admin flag
    if (profile['admin'] === true) return true;
    
    // Check for Administrator role
    return this.hasRole('Administrator');
  }

  /**
   * Check if user has a specific role
   */
  public hasRole(roleName: string): boolean {
    const profile = this.getUserProfile();
    if (!profile) return false;

    const roleClaim = profile['role'];
    if (!roleClaim) return false;

    if (Array.isArray(roleClaim)) {
      return roleClaim.includes(roleName);
    }

    return roleClaim === roleName;
  }

  /**
   * Get authorization header value
   */
  public getAuthorizationHeaderValue(): string {
    if (this.currentUser) {
      return `${this.currentUser.token_type} ${this.currentUser.access_token}`;
    }
    return '';
  }

  /**
   * Get access token value
   */
  public getAccessTokenValue(): string {
    return this.currentUser?.access_token || '';
  }

  /**
   * Initiate sign-in redirect
   */
  public async signinRedirect(options?: SignInRedirectOptions): Promise<void> {
    try {
      this.logger.info('Initiating sign-in redirect', options);
      const args: any = {};

      if (options?.location) {
        args.state = { url: options.location };
      }

      if (options?.promptRegister === true) {
        args.extraQueryParams = { operation: 'register' };
      }

      if (options?.tenant) {
        args.acr_values = `tenant:${options.tenant}`;
      }

      await this.userManager.signinRedirect(args);
      this.logger.debug('Sign-in redirect initiated successfully');
    } catch (error) {
      this.logger.error('Error during sign-in redirect', error);
      this.notifyError(error as Error);
      throw error;
    }
  }

  /**
   * Handle sign-in redirect callback
   */
  public async signinRedirectCallback(): Promise<User> {
    try {
      this.logger.debug('Processing sign-in redirect callback');
      const user = await this.userManager.signinRedirectCallback();
      this.logger.info('Sign-in callback successful', { userId: user.profile.sub, name: user.profile.name });
      this.currentUser = user;
      this.notifyUserChange(user);
      return user;
    } catch (error) {
      this.logger.error('Error during sign-in callback', error);
      this.notifyError(error as Error);
      throw error;
    }
  }

  /**
   * Initiate silent sign-in (token renewal)
   */
  public async signinSilent(): Promise<User | null> {
    try {
      this.logger.debug('Initiating silent sign-in');
      const user = await this.userManager.signinSilent();
      if (user) {
        this.logger.info('Silent sign-in successful', { userId: user.profile.sub });
        this.currentUser = user;
        this.notifyUserChange(user);
      }
      return user;
    } catch (error) {
      this.logger.error('Error during silent sign-in', error);
      this.notifyError(error as Error);
      return null;
    }
  }

  /**
   * Handle silent sign-in callback
   */
  public async signinSilentCallback(): Promise<User | undefined> {
    try {
      this.logger.debug('Processing silent sign-in callback');
      await this.userManager.signinSilentCallback();
      const user = await this.userManager.getUser();
      if (user) {
        this.logger.info('Silent sign-in callback successful', { userId: user.profile.sub });
        this.currentUser = user;
        this.notifyUserChange(user);
      }
      return user || undefined;
    } catch (error) {
      this.logger.error('Error during silent sign-in callback', error);
      this.notifyError(error as Error);
      throw error;
    }
  }

  /**
   * Initiate sign-out redirect
   */
  public async signoutRedirect(): Promise<void> {
    try {
      this.logger.info('Initiating sign-out redirect');
      await this.userManager.signoutRedirect();
      this.logger.debug('Sign-out redirect initiated successfully');
    } catch (error) {
      this.logger.error('Error during sign-out redirect', error);
      this.notifyError(error as Error);
      throw error;
    }
  }

  /**
   * Handle sign-out redirect callback
   */
  public async signoutRedirectCallback(): Promise<void> {
    try {
      this.logger.debug('Processing sign-out redirect callback');
      await this.userManager.signoutRedirectCallback();
      this.logger.info('Sign-out callback successful');
      this.currentUser = null;
      this.notifyUserChange(null);
    } catch (error) {
      this.logger.error('Error during sign-out callback', error);
      this.notifyError(error as Error);
      throw error;
    }
  }

  /**
   * Remove user from storage
   */
  public async removeUser(): Promise<void> {
    try {
      this.logger.debug('Removing user from storage');
      await this.userManager.clearStaleState();
      await this.userManager.removeUser();
      this.logger.info('User removed from storage successfully');
      this.currentUser = null;
      this.notifyUserChange(null);
    } catch (error) {
      this.logger.error('Error removing user', error);
      this.notifyError(error as Error);
      throw error;
    }
  }

  /**
   * Clear stale state from storage
   */
  public async clearStaleState(): Promise<void> {
    try {
      this.logger.debug('Clearing stale state from storage');
      await this.userManager.clearStaleState();
      this.logger.debug('Stale state cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing stale state', error);
    }
  }
}
