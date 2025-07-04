export interface Paste {
  id: string;
  title: string;
  content: string;
  created_at: string;
  hidden: boolean;
  user_id: number;
  username: string;
  view_count?: number; // Add this field
}

export interface CreatePasteRequest {
  title: string;
  content: string;
  hidden?: boolean;
}

export const api = {
  async createPaste(data: CreatePasteRequest, apiKey?: string): Promise<Paste> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch('/api/pastes/create', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create paste');
    }

    return response.json();
  },

  async getPaste(pasteId: string, apiKey?: string): Promise<Paste> {
    const headers: Record<string, string> = {};

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(`/api/pastes/${pasteId}`, {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch paste');
    }

    return response.json();
  },

  async updatePaste(pasteId: string, data: CreatePasteRequest, apiKey?: string): Promise<Paste> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(`/api/pastes/${pasteId}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update paste');
    }

    return response.json();
  },

  async deletePaste(pasteId: string, apiKey?: string): Promise<void> {
    const headers: Record<string, string> = {};

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(`/api/pastes/${pasteId}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete paste');
    }
  },

  async getMyPastes(apiKey?: string): Promise<Paste[]> {
    const headers: Record<string, string> = {};

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch('/api/user/my-pastes', {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch pastes');
    }

    return response.json();
  },

  async incrementViewCount(pasteId: string): Promise<{ view_count: number }> {
    const response = await fetch(`/api/pastes/${pasteId}/views`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to increment view count');
    }

    return response.json();
  },
};
