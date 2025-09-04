import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Alert, AlertDescription } from './ui/Alert';
import { CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface OAuthStatus {
  success: boolean;
  message?: string;
  details?: unknown;
  authUrl?: string;
}

export function OAuthFixer() {
  const [isLoading, setIsLoading] = useState(false);
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const testOAuthConfig = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/auth/test-oauth-config');
      const data = await response.json();
      setTestResult(data);
      
      if (data.success) {
// console.log('✅ OAuth configuration test passed');
      } else {
        console.error('❌ OAuth configuration test failed:', data.error);
      }
    } catch (error) {
      console.error('OAuth config test error:', error);
      setTestResult({
        success: false,
        error: 'Failed to test OAuth configuration',
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forceGoogleAuth = async () => {
    setIsLoading(true);
    setOauthStatus(null);
    
    try {
      const response = await fetch('/api/auth/force-google-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setOauthStatus(data);
      
      if (data.success && data.authUrl) {
// console.log('✅ Force authentication URL generated');
        // Auto-redirect to Google OAuth
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Force auth error:', error);
      setOauthStatus({
        success: false,
        message: 'Failed to initiate force authentication: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCurrentAuth = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
// console.log('Current auth status:', data);
      
      if (data.isAuthenticated) {
        setOauthStatus({
          success: true,
          message: `Already authenticated as ${data.user?.email || 'user'}`
        });
      } else {
        setOauthStatus({
          success: false,
          message: 'Not currently authenticated'
        });
      }
    } catch (error) {
      console.error('Auth status test error:', error);
      setOauthStatus({
        success: false,
        message: 'Failed to check authentication status: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const directGoogleAuth = () => {
// console.log('🔗 Redirecting to Google OAuth...');
    window.location.href = '/api/auth/google';
  };

  const testTokenRefresh = async () => {
    setIsLoading(true);
    setOauthStatus(null);
    
    try {
      const response = await fetch('/api/auth/test-token-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setOauthStatus(data);
      
      if (data.success) {
// console.log('✅ Token refresh test successful');
      } else {
        console.error('❌ Token refresh test failed:', data.error);
      }
    } catch (error) {
      console.error('Token refresh test error:', error);
      setOauthStatus({
        success: false,
        message: 'Failed to test token refresh: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCalendarAccess = async () => {
    setIsLoading(true);
    setOauthStatus(null);
    
    try {
      const response = await fetch('/api/auth/test-calendar-access');
      const data = await response.json();
      setOauthStatus(data);
      
      if (data.success) {
// console.log('✅ Calendar access test successful:', data.testResults);
      } else {
        console.error('❌ Calendar access test failed:', data.error);
      }
    } catch (error) {
      console.error('Calendar access test error:', error);
      setOauthStatus({
        success: false,
        message: 'Failed to test calendar access: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forceEnvTokens = async () => {
    setIsLoading(true);
    setOauthStatus(null);
    
    try {
      const response = await fetch('/api/auth/force-env-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setOauthStatus(data);
      
      if (data.success) {
// console.log('✅ Environment tokens applied successfully');
        // Refresh the page to apply the new tokens
        window.location.reload();
      } else {
        console.error('❌ Environment tokens failed:', data.error);
      }
    } catch (error) {
      console.error('Environment tokens error:', error);
      setOauthStatus({
        success: false,
        message: 'Failed to apply environment tokens: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokens = async () => {
    setIsLoading(true);
    setOauthStatus(null);
    
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
// console.log('✅ Tokens refreshed successfully');
        setOauthStatus({
          success: true,
          message: 'Google tokens refreshed successfully! You can now try syncing again.'
        });
      } else {
        console.error('❌ Token refresh failed:', data.error);
        setOauthStatus({
          success: false,
          message: data.error || 'Failed to refresh tokens',
          needsAuth: data.needsAuth
        });
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      setOauthStatus({
        success: false,
        message: 'Failed to refresh tokens: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const comprehensiveAuthFix = async () => {
    setIsLoading(true);
    setOauthStatus(null);
    
    try {
      const response = await fetch('/api/auth/fix-google-comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
// console.log('✅ Comprehensive auth fix completed');
        setOauthStatus({
          success: true,
          message: 'All expired tokens cleared. Please click the authentication URL to sign in again.',
          authUrl: data.authUrl
        });
      } else {
        console.error('❌ Comprehensive auth fix failed:', data.error);
        setOauthStatus({
          success: false,
          message: data.error || 'Failed to fix authentication'
        });
      }
    } catch (error) {
      console.error('Comprehensive auth fix error:', error);
      setOauthStatus({
        success: false,
        message: 'Failed to fix authentication: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enhancedCalendarSync = async () => {
    setIsLoading(true);
    setOauthStatus(null);
    
    try {
      const response = await fetch('/api/auth/enhanced-calendar-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
// console.log('✅ Enhanced calendar sync completed successfully');
        setOauthStatus({
          success: true,
          message: `Enhanced sync completed! ${data.totalEvents || 0} events synced from ${data.calendars || 0} calendars`
        });
        
        // Auto-refresh the page after 3 seconds to show new events
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        console.error('❌ Enhanced calendar sync failed:', data.error);
        
        // Handle specific error cases
        if (data.needsAuth || data.error?.includes('invalid_grant') || data.error?.includes('expired')) {
          setOauthStatus({
            success: false,
            message: 'Google tokens have expired. Use "Comprehensive Fix" to clear all tokens and re-authenticate.',
            needsAuth: true
          });
        } else {
          setOauthStatus({
            success: false,
            message: data.error || 'Failed to sync Google Calendar'
          });
        }
      }
    } catch (error) {
      console.error('Enhanced calendar sync error:', error);
      setOauthStatus({
        success: false,
        message: 'Failed to sync Google Calendar: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forceGoogleSync = async () => {
    setIsLoading(true);
    setOauthStatus(null);
    
    try {
      const response = await fetch('/api/auth/google/force-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
// console.log('✅ Google Calendar sync completed successfully');
        setOauthStatus({
          success: true,
          message: `Sync completed! ${data.syncedEvents || data.totalEvents || 0} events synced to database (${data.updatedEvents || 0} updated)`
        });
        
        // Auto-refresh the page after 3 seconds to show new events
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        console.error('❌ Google Calendar sync failed:', data.error);
        
        // Handle specific error cases
        if (data.needsAuth || data.error?.includes('invalid_grant') || data.error?.includes('expired')) {
          setOauthStatus({
            success: false,
            message: 'Google tokens have expired. Try "Comprehensive Fix" first to clear all tokens and re-authenticate.',
            needsAuth: true
          });
        } else {
          setOauthStatus({
            success: false,
            message: data.error || 'Failed to sync Google Calendar'
          });
        }
      }
    } catch (error) {
      console.error('Google Calendar sync error:', error);
      setOauthStatus({
        success: false,
        message: 'Failed to sync Google Calendar: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Google OAuth Authentication Fixer
        </CardTitle>
        <CardDescription>
          Test and fix Google OAuth authentication issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Test OAuth Configuration */}
        <div className="space-y-2">
          <Button 
            onClick={testOAuthConfig}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing Configuration...
              </>
            ) : (
              'Test OAuth Configuration'
            )}
          </Button>
          
          {testResult && (
            <Alert className={testResult.success ? 'border-green-500' : 'border-red-500'}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {testResult.success ? 'OAuth configuration is working correctly' : testResult.message}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        {/* Current Authentication Status */}
        <div className="space-y-2">
          <Button 
            onClick={testCurrentAuth}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            Check Current Authentication
          </Button>
        </div>

        {/* Direct Google Authentication */}
        <div className="space-y-2">
          <Button 
            onClick={directGoogleAuth}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Start Google Authentication
          </Button>
        </div>

        {/* Test Token Refresh */}
        <div className="space-y-2">
          <Button 
            onClick={testTokenRefresh}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            Test Token Refresh
          </Button>
        </div>

        {/* Test Calendar Access */}
        <div className="space-y-2">
          <Button 
            onClick={testCalendarAccess}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            Test Calendar Access
          </Button>
        </div>

        {/* Force Environment Tokens */}
        <div className="space-y-2">
          <Button 
            onClick={forceEnvTokens}
            disabled={isLoading}
            variant="outline"
            className="w-full bg-green-50 hover:bg-green-100 border-green-300"
          >
            Use Environment Tokens
          </Button>
        </div>

        {/* Comprehensive Authentication Fix */}
        <div className="space-y-2">
          <Button 
            onClick={comprehensiveAuthFix}
            disabled={isLoading}
            variant="outline"
            className="w-full bg-red-50 hover:bg-red-100 border-red-400 text-red-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            🔥 COMPREHENSIVE FIX
          </Button>
        </div>

        {/* Enhanced Calendar Sync */}
        <div className="space-y-2">
          <Button 
            onClick={enhancedCalendarSync}
            disabled={isLoading}
            variant="outline"
            className="w-full bg-green-50 hover:bg-green-100 border-green-400 text-green-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Enhanced Calendar Sync
          </Button>
        </div>

        {/* Refresh Tokens */}
        <div className="space-y-2">
          <Button 
            onClick={refreshTokens}
            disabled={isLoading}
            variant="outline"
            className="w-full bg-yellow-50 hover:bg-yellow-100 border-yellow-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Tokens
          </Button>
        </div>

        {/* Force Google Calendar Sync */}
        <div className="space-y-2">
          <Button 
            onClick={forceGoogleSync}
            disabled={isLoading}
            variant="outline"
            className="w-full bg-blue-50 hover:bg-blue-100 border-blue-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Google Calendar Sync
          </Button>
        </div>

        {/* Force Authentication */}
        <div className="space-y-2">
          <Button 
            onClick={forceGoogleAuth}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            Force New Authentication
          </Button>
        </div>

        {/* OAuth Status Display */}
        {oauthStatus && (
          <Alert className={oauthStatus.success ? 'border-green-500' : 'border-red-500'}>
            <div className="flex items-center gap-2">
              {oauthStatus.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <div className="flex-1">
                <AlertDescription>{oauthStatus.message}</AlertDescription>
                {oauthStatus.authUrl && (
                  <div className="mt-2">
                    <Button 
                      onClick={() => window.open(oauthStatus.authUrl, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Sign in to Google
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>🔥 <strong>For persistent issues:</strong> Use "COMPREHENSIVE FIX" to clear ALL tokens and restart authentication</li>
            <li>✅ <strong>For normal sync:</strong> Use "Enhanced Calendar Sync" for improved token handling</li>
            <li>🔄 <strong>For expired tokens:</strong> Try "Refresh Tokens" first</li>
            <li>📅 <strong>For fallback sync:</strong> Use "Force Google Calendar Sync" as backup</li>
            <li>🔧 <strong>For complete reset:</strong> Use "Start Google Authentication" for fresh login</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}