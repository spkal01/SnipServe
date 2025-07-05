import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  apiKey: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, inviteCode: string) => Promise<string>;
  logout: () => Promise<void>;
  refreshApiKey: () => Promise<string>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData.id,
          username: userData.username,
          is_admin: userData.is_admin 
        });
        
        // Try to get API key
        const keyResponse = await fetch('/api/user/api-key', {
          credentials: 'include'
        });
        if (keyResponse.ok) {
          const keyData = await keyResponse.json();
          setApiKey(keyData.api_key);
        }
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setApiKey(data.api_key);
    
    // Get user info after login
    await checkAuthStatus();
  };

  const register = async (username: string, password: string, inviteCode: string) => {
    const response = await fetch('/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        username, 
        password, 
        invite_code: inviteCode 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    setApiKey(data.api_key);
    
    // Get user info after registration
    await checkAuthStatus();
    
    return data.api_key;
  };

  const logout = async () => {
    await fetch('/api/user/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    setUser(null);
    setApiKey(null);
  };

  const refreshApiKey = async () => {
    const response = await fetch('/api/user/api-key', {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to refresh API key');
    }

    const data = await response.json();
    setApiKey(data.api_key);
    return data.api_key;
  };

  const value = {
    user,
    apiKey,
    login,
    register,
    logout,
    refreshApiKey,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
