const ConfigApi = {
  // GET config workspace
  async getConfig() {
    const token = ApiTokens?.getAccessToken();
    const res = await fetch('/api/v1/config', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to get config');
    const data = await res.json();
    return data.data;
  },

  // PUT update config
  async updateConfig(config) {
    const token = ApiTokens?.getAccessToken();
    const res = await fetch('/api/v1/config', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Failed to update config');
    const data = await res.json();
    return data.data;
  },

  // POST upload logo
  async uploadLogo(file) {
    const token = ApiTokens?.getAccessToken();
    const formData = new FormData();
    formData.append('logo', file);

    const res = await fetch('/api/v1/config/upload-logo', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload logo');
    }
    const data = await res.json();
    return data.data.logo_url;
  },

  // DELETE logo
  async deleteLogo() {
    const token = ApiTokens?.getAccessToken();
    const res = await fetch('/api/v1/config/logo', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete logo');
  }
};

window.ConfigApi = ConfigApi;
console.log('✅ ConfigApi loaded');
