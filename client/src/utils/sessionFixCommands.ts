
// Session Fix Commands - Available in browser console
// Usage: fixSessionNow(), testAuthenticatedSession(), etc.

class SessionFixCommands {
  static async fixSessionNow() {
// console.log('🔧 Starting comprehensive session fix...');
    
    try {
      // Step 1: Check current session status
      const statusResponse = await fetch('/api/auth/status', { credentials: 'include' });
      const status = await statusResponse.json();
// console.log('📊 Current auth status:', status);
      
      // Step 2: Try the force-fix endpoint first
// console.log('🔧 Attempting force authentication fix...');
      const forceFixResponse = await fetch('/api/auth/force-fix', { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (forceFixResponse.ok) {
        const forceFixResult = await forceFixResponse.json();
// console.log('✅ Force fix result:', forceFixResult);
        
        if (forceFixResult.success) {
          // Wait a moment for session to propagate
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verify authentication worked
          const verifyResponse = await fetch('/api/auth/status', { credentials: 'include' });
          const verifyStatus = await verifyResponse.json();
// console.log('✅ Post-fix auth status:', verifyStatus);
          
          if (verifyStatus.authenticated) {
// console.log('🎉 Authentication fixed successfully!');
            window.location.reload();
            return;
          }
        }
      }
      
      // Step 3: If force-fix didn't work, try other methods
      const fixResponse = await fetch('/api/auth/fix-session', { 
        method: 'POST', 
        credentials: 'include' 
      });
      const fixResult = await fixResponse.json();
// console.log('🔧 Session fix result:', fixResult);
      
      // Step 4: Check if tokens exist in environment
      const configResponse = await fetch('/api/auth/test-oauth-config', { credentials: 'include' });
      const config = await configResponse.json();
// console.log('🔑 OAuth config:', config);
      
      // Step 5: If we have tokens but no session, try to restore
      if (config.hasAccessToken && !status.authenticated) {
// console.log('🔄 Attempting session restoration...');
        const restoreResponse = await fetch('/api/auth/restore-session', { 
          method: 'POST',
          credentials: 'include'
        });
        const restoreResult = await restoreResponse.json();
// console.log('✨ Session restoration result:', restoreResult);
      }
      
      // Step 6: Final status check
      const finalStatus = await fetch('/api/auth/status', { credentials: 'include' });
      const final = await finalStatus.json();
// console.log('✅ Final auth status:', final);
      
      if (final.authenticated) {
// console.log('🎉 Authentication fixed successfully!');
        window.location.reload();
      } else {
// console.log('⚠️ Authentication still requires attention');
// console.log('💡 Try: forceGoogleOAuth() for fresh authentication');
      }
      
    } catch (error) {
      console.error('❌ Session fix error:', error);
    }
  }
  
  static async testAuthenticatedSession() {
// console.log('🧪 Testing authenticated session...');
    
    try {
      // Test various auth endpoints
      const endpoints = [
        '/api/auth/status',
        '/api/auth/quick-diag',
        '/api/events',
        '/api/auth/test-calendar-access'
      ];
      
      for (const endpoint of endpoints) {
// console.log(`🔍 Testing ${endpoint}...`);
        const response = await fetch(endpoint);
        const result = await response.json();
// console.log(`📡 ${endpoint} (${response.status}):`, result);
      }
      
    } catch (error) {
      console.error('❌ Session test error:', error);
    }
  }
  
  static async clearAuthenticationData() {
// console.log('🧹 Clearing authentication data...');
    
    try {
      // Clear all possible auth storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies (if accessible)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
// console.log('✅ Local authentication data cleared');
// console.log('💡 Use forceGoogleOAuth() to start fresh authentication');
      
    } catch (error) {
      console.error('❌ Clear auth data error:', error);
    }
  }
  
  static forceGoogleOAuth() {
// console.log('🔄 Forcing fresh Google OAuth...');
    window.location.href = '/api/auth/google';
  }
  
  static async runDiagnostics() {
// console.log('🚨 Running comprehensive diagnostics...');
    
    try {
      const diagResponse = await fetch('/api/auth/quick-diag');
      const diag = await diagResponse.json();
      
// console.log('📊 Full Diagnostics:', diag);
      
      // Show user-friendly summary
      const summary = `
Session: ${diag.session?.exists ? '✅ Exists' : '❌ Missing'}
User: ${diag.session?.user ? `✅ ${diag.session.user.email}` : '❌ None'}
Tokens: ${diag.environment?.hasAccessToken ? '✅ Present' : '❌ Missing'}
Recommendations: ${diag.recommendations?.join(', ') || 'None'}
      `.trim();
      
// console.log('📋 Summary:', summary);
      
      if (!diag.session?.user) {
// console.log('🔧 No user found, running automatic fix...');
        await this.fixSessionNow();
      }
      
    } catch (error) {
      console.error('❌ Diagnostics error:', error);
    }
  }
}

// Make commands globally available
window.fixSessionNow = () => SessionFixCommands.fixSessionNow();
window.testAuthenticatedSession = () => SessionFixCommands.testAuthenticatedSession();
window.clearAuthenticationData = () => SessionFixCommands.clearAuthenticationData();
window.forceGoogleOAuth = () => SessionFixCommands.forceGoogleOAuth();
window.runDiagnostics = () => SessionFixCommands.runDiagnostics();

// Display available commands
// console.log('🛠️ Session fix commands available:');
// console.log('  fixSessionNow() - Fix authentication session');
// console.log('  testAuthenticatedSession() - Test and debug session');
// console.log('  clearAuthenticationData() - Clear all auth data');
// console.log('  forceGoogleOAuth() - Force fresh OAuth');
// console.log('  runDiagnostics() - Run comprehensive diagnostics');

// Auto-run authentication fix on module load if needed
async function checkAndFixAuth() {
  try {
    const response = await fetch('/api/auth/status', { credentials: 'include' });
    const status = await response.json();
    
    if (!status.authenticated) {
// console.log('🔧 No authentication detected, running auto-fix...');
      await SessionFixCommands.fixSessionNow();
    }
  } catch (error) {
// console.log('Auth check failed:', error);
  }
}

// Run auth check after a short delay to ensure DOM is ready
setTimeout(checkAndFixAuth, 1000);

export { SessionFixCommands };
