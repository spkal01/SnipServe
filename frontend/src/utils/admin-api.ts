export interface AdminUser {
  id: number;
  username: string;
  is_admin: boolean;
  created_at: string;
}

export interface AdminPaste {
  id: string;
  title: string;
  content: string;
  created_at: string;
  hidden: boolean;
  user_id: number;
  username: string;
  view_count: number;
}

export interface PasteAnalytics {
  paste_id: string;
  title: string;
  total_views: number;
  unique_ips: number;
  authenticated_views: number;
  recent_views: number;
}

export interface AdminStats {
  total_users: number;
  total_pastes: number;
  total_views: number;
  recent_activity: number;
  top_pastes: PasteAnalytics[];
  recent_users: AdminUser[];
}

export interface CreateUserRequest {
  username: string;
  password: string;
  is_admin: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  is_admin?: boolean;
}

export const adminApi = {
  async getUsers(apiKey?: string): Promise<AdminUser[]> {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch('/api/admin/users', {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }

    return response.json();
  },

  async getUser(username: string, apiKey?: string): Promise<AdminUser> {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(`/api/admin/user/${username}`, {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user');
    }

    return response.json();
  },

  async deleteUser(username: string, apiKey?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(`/api/admin/user/${username}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
  },

  async getAllPastes(apiKey?: string): Promise<AdminPaste[]> {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch('/api/manage/pastes', {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch pastes');
    }

    return response.json();
  },

  async getPasteAnalytics(pasteId?: string, apiKey?: string): Promise<PasteAnalytics[] | PasteAnalytics> {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const url = pasteId ? `/api/admin/paste-analytics/${pasteId}` : '/api/admin/paste-analytics';
    const response = await fetch(url, {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch analytics');
    }

    return response.json();
  },

  async createUser(userData: CreateUserRequest, apiKey?: string): Promise<AdminUser> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    return response.json();
  },


  async updateUser(username: string, userData: UpdateUserRequest, apiKey?: string): Promise<AdminUser> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(`/api/admin/user/${username}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }

    return response.json();
  },
};