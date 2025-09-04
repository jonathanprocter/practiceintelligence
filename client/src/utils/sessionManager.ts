/**
 * Complete Session Management System
 * Handles authentication, logout, and session recovery
 */

export class SessionManager {
  /**
   * Complete logout cycle - clears all authentication data
   */
  static async completeLogout(): Promise<void> {
    try {
// console.log('🔄 Starting complete logout process...');
      
      // 1. Call server logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // 2. Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // 3. Clear any cached authentication state
      if (window.queryClient) {
        window.queryClient.clear();
      }
      
      // 4. Redirect to login or refresh page
      window.location.href = '/';
      
// console.log('✅ Complete logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force refresh even if logout fails
      window.location.reload();
    }
  }

  /**
   * Test authentication session completeness
   */
  static async testCompleteAuthSession(): Promise<boolean> {
    try {
// console.log('🧪 Testing complete authentication session...');
      
      // Test auth status
      const authResponse = await fetch('/api/auth/status', {
        credentials: 'include'
      });
      
      if (!authResponse.ok) {
// console.log('❌ Auth status check failed');
        return false;
      }
      
      const authData = await authResponse.json();
// console.log('🔍 Auth status:', authData);
      
      if (!authData.authenticated || !authData.hasValidTokens) {
// console.log('❌ Authentication incomplete');
        return false;
      }
      
      // Test protected endpoint access
      const eventsResponse = await fetch('/api/events', {
        credentials: 'include'
      });
      
      if (!eventsResponse.ok) {
// console.log('❌ Protected endpoint access failed');
        return false;
      }
      
// console.log('✅ Complete authentication session verified');
      return true;
    } catch (error) {
      console.error('❌ Session test error:', error);
      return false;
    }
  }

  /**
   * Check and clear invalid sessions
   */
  static async clearInvalidSessions(): Promise<void> {
    try {
// console.log('🧹 Checking for invalid sessions...');
      
      // Test current session
      const isValid = await this.testCompleteAuthSession();
      
      if (!isValid) {
// console.log('🚮 Clearing invalid session...');
        await this.completeLogout();
      }
    } catch (error) {
      console.error('❌ Session clearing error:', error);
    }
  }

  /**
   * Force fresh OAuth flow (for testing)
   */
  static async forceNewOAuthFlow(): Promise<void> {
    try {
// console.log('🔄 Forcing fresh OAuth flow...');
      
      // Clear existing session first
      await this.completeLogout();
      
      // Small delay for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to OAuth
      window.location.href = '/api/auth/google';
    } catch (error) {
      console.error('❌ OAuth flow error:', error);
    }
  }

  /**
   * Verify cookie handling
   */
  static verifySessionCookies(): boolean {
    // Check if session cookie exists
    const cookies = document.cookie.split(';');
    const hasSessionCookie = cookies.some(cookie => 
      cookie.trim().startsWith('remarkable.sid=')
    );
    
// console.log('🍪 Session cookie present:', hasSessionCookie);
    return hasSessionCookie;
  }

  /**
   * Complete session diagnostics
   */
  static async runCompleteDiagnostics(): Promise<void> {
// console.log('🔧 Running complete session diagnostics...');
    
    // 1. Check cookies
    const hasCookies = this.verifySessionCookies();
// console.log('1. Session cookies:', hasCookies ? '✅' : '❌');
    
    // 2. Test authentication
    const isAuthenticated = await this.testCompleteAuthSession();
// console.log('2. Authentication:', isAuthenticated ? '✅' : '❌');
    
    // 3. Check local storage
    const hasLocalStorage = localStorage.length > 0;
// console.log('3. Local storage:', hasLocalStorage ? '✅' : '❌');
    
    // 4. Test API connectivity
    try {
      const response = await fetch('/api/auth/status', { credentials: 'include' });
// console.log('4. API connectivity:', response.ok ? '✅' : '❌');
    } catch (error) {
// console.log('4. API connectivity: ❌');
    }
    
    // Summary
// console.log('\n📋 Diagnostic Summary:');
    if (hasCookies && isAuthenticated) {
// console.log('✅ Session appears healthy');
    } else {
// console.log('❌ Session issues detected - consider logout/login cycle');
    }
  }
}

// Make functions available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).sessionManager = SessionManager;
  (window as any).completeLogout = SessionManager.completeLogout;
  (window as any).testCompleteAuthSession = SessionManager.testCompleteAuthSession;
  (window as any).forceNewOAuthFlow = SessionManager.forceNewOAuthFlow;
  (window as any).runCompleteDiagnostics = SessionManager.runCompleteDiagnostics;
  (window as any).clearInvalidSessions = SessionManager.clearInvalidSessions;
}