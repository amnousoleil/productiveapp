// =============================================
// MAIL TEMPLATES v3.0 - Générateur IA Élégant
// Inspiré de PromptForge, style mail épuré
// =============================================

const MailTemplates = {
  view: 'generator', // 'generator' | 'library'
  generating: false,
  generated: null, // { subject, body, category }
  savedTemplates: [],

  /* ---- Bibliothèque pré-faite ---- */
  prebuilt: {
    'Bienvenue': {
      color: '#22c55e', icon: '👋',
      items: [
        { name: 'Bienvenue client',   subject: 'Bienvenue chez nous, {{prénom}} !', body: 'Bonjour {{prénom}},\n\nNous sommes ravis de vous accueillir ! Votre compte est prêt.\n\nPour démarrer, rendez-vous sur votre espace : {{lien}}\n\nÀ très vite,\nL\'équipe {{entreprise}}' },
        { name: 'Onboarding étape 1', subject: 'Votre guide de démarrage', body: 'Bonjour {{prénom}},\n\n3 étapes pour bien commencer :\n1. Complétez votre profil\n2. Découvrez les fonctionnalités clés\n3. Contactez-nous en cas de besoin\n\nCordialement,\n{{signature}}' }
      ]
    },
    'Commercial': {
      color: '#f59e0b', icon: '💼',
      items: [
        { name: 'Prospection', subject: 'Une opportunité taillée pour {{entreprise}}', body: 'Bonjour {{prénom}},\n\nJ\'ai remarqué que {{entreprise}} cherche à {{objectif}}. Nous aidons des sociétés comme la vôtre à {{bénéfice}} en {{délai}}.\n\nSeriez-vous disponible 15 minutes cette semaine pour en discuter ?\n\nBien cordialement,\n{{signature}}' },
        { name: 'Proposition commerciale', subject: 'Notre proposition pour {{projet}}', body: 'Bonjour {{prénom}},\n\nSuite à notre échange, voici notre proposition détaillée pour {{projet}}.\n\n— Solution retenue : {{solution}}\n— Investissement : {{prix}}\n— Délai de mise en œuvre : {{délai}}\n\nJe reste disponible pour tout ajustement.\n\n{{signature}}' }
      ]
    },
    'Relance': {
      color: '#8b5cf6', icon: '🔄',
      items: [
        { name: 'Relance douce', subject: 'Avez-vous eu le temps de réfléchir ?', body: 'Bonjour {{prénom}},\n\nJe me permets de revenir vers vous concernant notre échange du {{date}}.\n\nSi vous avez des questions ou souhaitez des informations complémentaires, je suis là.\n\nCordialement,\n{{signature}}' },
        { name: 'Relance devis', subject: 'Votre devis — toujours d\'actualité', body: 'Bonjour {{prénom}},\n\nVotre devis du {{date}} est valable jusqu\'au {{expiration}}. N\'hésitez pas à me contacter pour toute question.\n\nBien à vous,\n{{signature}}' }
      ]
    },
    'Support': {
      color: '#3b82f6', icon: '🎧',
      items: [
        { name: 'Accusé de réception', subject: 'Votre demande a bien été reçue [#{{ticket}}]', body: 'Bonjour {{prénom}},\n\nNous avons bien reçu votre demande (#{{ticket}}) et nos équipes la traitent actuellement.\n\nDélai de réponse estimé : {{délai}}.\n\nMerci de votre confiance,\nL\'équipe Support' },
        { name: 'Résolution', subject: 'Votre problème a été résolu [#{{ticket}}]', body: 'Bonjour {{prénom}},\n\nVotre problème (ticket #{{ticket}}) a été résolu. Voici ce qui a été fait : {{action}}.\n\nN\'hésitez pas à nous recontacter si besoin.\n\nCordialement,\nL\'équipe Support' }
      ]
    },
    'Remerciement': {
      color: '#ec4899', icon: '💝',
      items: [
        { name: 'Merci client', subject: 'Merci pour votre confiance !', body: 'Bonjour {{prénom}},\n\nUn grand merci pour votre confiance et votre commande. Nous mettons tout en œuvre pour dépasser vos attentes.\n\nN\'hésitez pas à partager votre avis : {{lien_avis}}\n\nÀ très bientôt,\n{{signature}}' },
        { name: 'Merci partenaire', subject: 'Merci pour notre collaboration', body: 'Bonjour {{prénom}},\n\nJe tenais à vous remercier personnellement pour votre implication dans {{projet}}. Notre collaboration a été un vrai succès.\n\nJ\'espère que nous aurons l\'occasion de retravailler ensemble bientôt.\n\nBien cordialement,\n{{signature}}' }
      ]
    },
    'Marketing': {
      color: '#06b6d4', icon: '📣',
      items: [
        { name: 'Newsletter mensuelle', subject: '{{entreprise}} · Les news du mois', body: 'Bonjour {{prénom}},\n\n🔥 Au programme ce mois-ci :\n\n• {{actualité_1}}\n• {{actualité_2}}\n• {{actualité_3}}\n\n👉 Découvrez tout ici : {{lien}}\n\nÀ bientôt,\nL\'équipe {{entreprise}}' },
        { name: 'Offre promotionnelle', subject: '{{remise}}% de réduction — Offre limitée ⏰', body: 'Bonjour {{prénom}},\n\nPendant {{durée}}, profitez de {{remise}}% sur {{offre}}.\n\n✅ Code promo : {{code}}\n\nValable jusqu\'au {{expiration}}.\n\nProfitez-en : {{lien}}\n\n{{signature}}' }
      ]
    }
  },

  tones: [
    { id: 'professionnel', label: 'Professionnel' },
    { id: 'chaleureux',    label: 'Chaleureux'    },
    { id: 'direct',        label: 'Direct'         },
    { id: 'créatif',       label: 'Créatif'        }
  ],
  selectedTone: 'professionnel',

  async load() {
    const container = document.getElementById('mail-templates-content');
    if (!container) return;
    await this.loadSaved();
    this.render();
  },

  async loadSaved() {
    try {
      const result = await MailAPI.getTemplates();
      this.savedTemplates = result.templates || [];
    } catch (_) { this.savedTemplates = []; }
  },

  render() {
    const container = document.getElementById('mail-templates-content');
    if (!container) return;

    container.innerHTML = `
      <div class="mt-container">
        ${this.renderHeader()}
        <div class="mt-views">
          ${this.view === 'generator' ? this.renderGenerator() : this.renderLibrary()}
        </div>
      </div>
    `;
    this.attachEvents();
  },

  renderHeader() {
    return `
      <div class="mt-header">
        <div class="mt-header-left">
          <div class="mt-header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div>
            <h2 class="mt-title">Générateur de templates</h2>
            <p class="mt-subtitle">Créez ou choisissez un template email parfait</p>
          </div>
        </div>
        <div class="mt-tabs">
          <button class="mt-tab ${this.view === 'generator' ? 'active' : ''}" data-mt-tab="generator">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Générateur IA
          </button>
          <button class="mt-tab ${this.view === 'library' ? 'active' : ''}" data-mt-tab="library">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Bibliothèque
          </button>
        </div>
      </div>
    `;
  },

  renderGenerator() {
    return `
      <div class="mt-generator">

        <div class="mt-input-card${this.generating ? ' mt-generating' : ''}">
          ${this.generating ? `<div class="mt-gen-overlay"><div class="mt-gen-spinner"></div><span>Génération en cours…</span></div>` : ''}

          <label class="mt-label">Décrivez votre email</label>
          <textarea id="mt-goal" class="mt-textarea" placeholder="Ex: Email pour relancer un prospect qui n'a pas répondu à mon devis depuis 1 semaine…">${this.generating ? '' : ''}</textarea>

          <div class="mt-tone-row">
            <span class="mt-tone-label">Ton :</span>
            ${this.tones.map(t => `
              <button class="mt-tone-btn ${this.selectedTone === t.id ? 'active' : ''}" data-tone="${t.id}">${t.label}</button>
            `).join('')}
          </div>
        </div>

        <button class="mt-generate-btn" id="mt-generate-btn" ${this.generating ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          <span>${this.generating ? 'Génération…' : 'Générer le template'}</span>
        </button>

        ${this.generated ? this.renderResult() : this.renderQuickPicks()}
      </div>
    `;
  },

  renderResult() {
    const g = this.generated;
    return `
      <div class="mt-result">
        <div class="mt-result-header">
          <div class="mt-result-meta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Template généré</span>
            ${g.category ? `<span class="mt-cat-badge" style="--mc: ${g.catColor || 'var(--accent)'}">${g.category}</span>` : ''}
          </div>
          <div class="mt-result-actions">
            <button class="mt-btn-sm" id="mt-copy-btn">Copier</button>
            <button class="mt-btn-sm mt-btn-save" id="mt-save-btn">Sauvegarder</button>
            <button class="mt-btn-sm mt-btn-use" id="mt-use-btn">Utiliser →</button>
          </div>
        </div>

        <div class="mt-result-fields">
          <div class="mt-field-row">
            <label class="mt-field-label">Sujet</label>
            <input type="text" class="mt-field-input" id="mt-result-subject" value="${this.escapeHtml(g.subject)}">
          </div>
          <div class="mt-field-row mt-field-body">
            <label class="mt-field-label">Corps</label>
            <textarea class="mt-field-textarea" id="mt-result-body" rows="10">${this.escapeHtml(g.body)}</textarea>
          </div>
        </div>
        <p class="mt-edit-hint">✏️ Modifiez librement avant d'utiliser</p>
      </div>
    `;
  },

  renderQuickPicks() {
    const categories = Object.entries(this.prebuilt).slice(0, 3);
    return `
      <div class="mt-quickpicks">
        <p class="mt-quickpicks-label">— ou choisissez un template prêt à l'emploi —</p>
        <div class="mt-quickpicks-grid">
          ${categories.map(([cat, cfg]) => `
            <div class="mt-quick-cat" style="--mc: ${cfg.color}">
              <div class="mt-quick-cat-header">
                <span class="mt-quick-dot"></span>
                <span class="mt-quick-icon">${cfg.icon}</span>
                <span class="mt-quick-name">${cat}</span>
              </div>
              ${cfg.items.slice(0, 2).map(tpl => `
                <button class="mt-quick-item" data-quick-subject="${this.escapeHtml(tpl.subject)}" data-quick-body="${this.escapeHtml(tpl.body)}">
                  <span class="mt-quick-item-name">${tpl.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              `).join('')}
            </div>
          `).join('')}
        </div>
        <button class="mt-see-all-btn" data-mt-tab="library">Voir toute la bibliothèque →</button>
      </div>
    `;
  },

  renderLibrary() {
    return `
      <div class="mt-library">
        ${Object.entries(this.prebuilt).map(([cat, cfg]) => `
          <div class="mt-lib-group" style="--mc: ${cfg.color}">
            <div class="mt-lib-group-header">
              <span class="mt-lib-dot"></span>
              <span class="mt-lib-icon">${cfg.icon}</span>
              <span class="mt-lib-name">${cat}</span>
              <span class="mt-lib-count">${cfg.items.length}</span>
            </div>
            <div class="mt-lib-cards">
              ${cfg.items.map(tpl => `
                <div class="mt-lib-card">
                  <div class="mt-lib-card-body">
                    <h4 class="mt-lib-card-title">${tpl.name}</h4>
                    <p class="mt-lib-card-subject">${this.escapeHtml(tpl.subject)}</p>
                    <p class="mt-lib-card-preview">${this.escapeHtml(tpl.body.substring(0, 80))}…</p>
                  </div>
                  <div class="mt-lib-card-actions">
                    <button class="mt-btn-sm mt-btn-use" data-lib-subject="${this.escapeHtml(tpl.subject)}" data-lib-body="${this.escapeHtml(tpl.body)}">Utiliser</button>
                    <button class="mt-btn-sm" data-lib-copy-subject="${this.escapeHtml(tpl.subject)}" data-lib-copy-body="${this.escapeHtml(tpl.body)}">Copier</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  async generateTemplate() {
    const goal = document.getElementById('mt-goal')?.value?.trim();
    if (!goal) { Toast && Toast.warning('Décrivez d\'abord votre email'); return; }
    if (!window.ApiAi || !ApiAi.isAvailable?.()) { Toast && Toast.error('IA non disponible'); return; }

    this.generating = true;
    this.render();

    const prompt = `Tu es un expert en rédaction d'emails professionnels.
Génère un template d'email complet en JSON avec ce format exact :
{"subject": "...", "body": "...", "category": "..."}

Objectif : ${goal}
Ton : ${this.selectedTone}

Règles :
- Sujet court et accrocheur (max 60 caractères)
- Corps structuré avec des retours à la ligne
- Utilise {{prénom}}, {{signature}} etc. pour les variables
- Catégorie parmi : Bienvenue, Commercial, Relance, Support, Remerciement, Marketing
- Réponds UNIQUEMENT avec le JSON, sans markdown ni explication`;

    try {
      const response = await ApiAi.generate(prompt, { max_tokens: 600 });
      const text = response?.content || response?.text || response || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Format invalide');
      const parsed = JSON.parse(jsonMatch[0]);
      const catColors = { Bienvenue:'#22c55e', Commercial:'#f59e0b', Relance:'#8b5cf6', Support:'#3b82f6', Remerciement:'#ec4899', Marketing:'#06b6d4' };
      this.generated = { subject: parsed.subject || '', body: parsed.body || '', category: parsed.category || '', catColor: catColors[parsed.category] || 'var(--accent)' };
    } catch (e) {
      console.error('[MailTemplates] generate error:', e);
      Toast && Toast.error('Erreur de génération — réessayez');
    }

    this.generating = false;
    this.render();
  },

  useTemplate(subject, body) {
    if (typeof MailComposer !== 'undefined') {
      MailComposer.open({ subject, body });
    } else {
      Toast && Toast.error('Compositeur non disponible');
    }
  },

  copyTemplate(subject, body) {
    const text = `Sujet : ${subject}\n\n${body}`;
    navigator.clipboard?.writeText(text).then(() => Toast && Toast.success('✓ Copié !'));
  },

  async saveGenerated() {
    const subject = document.getElementById('mt-result-subject')?.value?.trim();
    const body = document.getElementById('mt-result-body')?.value?.trim();
    if (!subject || !body) return;
    try {
      await MailAPI.createTemplate({ name: subject.substring(0, 40), subject, body, isHtml: false });
      Toast && Toast.success('✓ Template sauvegardé');
    } catch (e) {
      Toast && Toast.error('Erreur lors de la sauvegarde');
    }
  },

  attachEvents() {
    // Tabs
    document.querySelectorAll('[data-mt-tab]').forEach(btn => {
      btn.addEventListener('click', e => {
        this.view = e.currentTarget.dataset.mtTab;
        this.render();
      });
    });

    // Tone buttons
    document.querySelectorAll('.mt-tone-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        this.selectedTone = e.currentTarget.dataset.tone;
        document.querySelectorAll('.mt-tone-btn').forEach(b => b.classList.toggle('active', b === e.currentTarget));
      });
    });

    // Generate button
    document.getElementById('mt-generate-btn')?.addEventListener('click', () => this.generateTemplate());

    // Result actions
    document.getElementById('mt-use-btn')?.addEventListener('click', () => {
      const s = document.getElementById('mt-result-subject')?.value;
      const b = document.getElementById('mt-result-body')?.value;
      if (s && b) this.useTemplate(s, b);
    });
    document.getElementById('mt-copy-btn')?.addEventListener('click', () => {
      const s = document.getElementById('mt-result-subject')?.value;
      const b = document.getElementById('mt-result-body')?.value;
      if (s && b) this.copyTemplate(s, b);
    });
    document.getElementById('mt-save-btn')?.addEventListener('click', () => this.saveGenerated());

    // Quick picks
    document.querySelectorAll('.mt-quick-item').forEach(btn => {
      btn.addEventListener('click', e => {
        const subject = e.currentTarget.dataset.quickSubject;
        const body = e.currentTarget.dataset.quickBody;
        this.useTemplate(subject, body);
      });
    });

    // Library use/copy
    document.querySelectorAll('[data-lib-subject]').forEach(btn => {
      btn.addEventListener('click', e => {
        this.useTemplate(e.currentTarget.dataset.libSubject, e.currentTarget.dataset.libBody);
      });
    });
    document.querySelectorAll('[data-lib-copy-subject]').forEach(btn => {
      btn.addEventListener('click', e => {
        this.copyTemplate(e.currentTarget.dataset.libCopySubject, e.currentTarget.dataset.libCopyBody);
      });
    });
  },

  escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text || '';
    return d.innerHTML;
  }
};

window.MailTemplates = MailTemplates;
