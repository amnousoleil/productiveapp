const ConfigUploader = {
  init(dropzoneEl, previewEl, onUpload) {
    this.dropzone = dropzoneEl;
    this.preview = previewEl;
    this.onUpload = onUpload;
    this.attachEvents();
  },

  attachEvents() {
    // Click pour ouvrir file picker
    this.dropzone.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => this.handleFile(e.target.files[0]);
      input.click();
    });

    // Drag & drop
    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('drag-over');
    });

    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('drag-over');
    });

    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleFile(file);
      }
    });
  },

  async handleFile(file) {
    // Validation
    if (file.size > 5 * 1024 * 1024) {
      window.Toast?.error('Image trop grande (max 5MB)');
      return;
    }

    // Preview locale
    const reader = new FileReader();
    reader.onload = (e) => {
      this.preview.src = e.target.result;
      this.preview.style.display = 'block';
      const placeholder = this.dropzone.querySelector('.upload-placeholder');
      if (placeholder) placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);

    // Upload vers backend
    try {
      const logoUrl = await ConfigApi.uploadLogo(file);
      this.onUpload(logoUrl);
      window.Toast?.success('✅ Logo téléchargé !');
    } catch (error) {
      console.error('Upload error:', error);
      window.Toast?.error('❌ Erreur upload logo: ' + error.message);
    }
  }
};

window.ConfigUploader = ConfigUploader;
console.log('✅ ConfigUploader loaded');
