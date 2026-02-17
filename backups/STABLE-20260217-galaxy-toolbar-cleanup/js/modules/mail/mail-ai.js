// =============================================
// MAIL AI v1.0 - Intelligence Artificielle
// Smart Reply | Priority Triage | Extract Tasks
// =============================================

const MailAI = {

  // Cache des priorités (localStorage)
  _priorityCache: {},

  // =============================================
  // FEATURE 1 — SMART REPLY
  // Génère une réponse professionnelle en 1 clic
  // =============================================

  /**
   * Génère une réponse IA et ouvre le compositeur
   */
  async generateReply(email, buttonEl) {
    if (!ApiAi || !ApiAi.isAvailable()) {
      if (typeof Toast !== 'undefined') Toast.error('IA non disponible');
      return;
    }

    // Loading state
    const originalText = buttonEl.innerHTML;
    buttonEl.disabled = true;
    buttonEl.innerHTML = '<span class="mail-ai-spinner"></span> Génération...';

    try {
      const fromName = email.from_name || email.from_address || 'l\'expéditeur';
      const bodyText = (email.body_text || '')
        .replace(/\\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .substring(0, 1000);

      const prompt = `Tu dois rédiger une réponse professionnelle en français à cet email reçu.

Email reçu:
De: ${fromName} <${email.from_address || ''}>
Sujet: ${email.subject || '(sans objet)'}
Corps:
${bodyText}

Rédige une réponse courtoise, professionnelle et directe. Commence directement par la salutation sans introduction. Maximum 150 mots.`;

      const reply = await ApiAi.generate(prompt,
        'Tu es un assistant de messagerie professionnel. Tu rédiges des réponses claires, courtoises et efficaces en français.'
      );

      // Fermer le modal de détail
      document.querySelectorAll('.mail-modal-overlay').forEach(el => el.remove());

      // Ouvrir le compositeur avec la réponse pré-remplie
      if (typeof MailComposer !== 'undefined') {
        MailComposer.open({
          to: [email.from_address],
          subject: `Re: ${email.subject || ''}`,
          body: reply.trim(),
          isHtml: false
        });
      }

      if (typeof Toast !== 'undefined') Toast.success('✨ Réponse générée par l\'IA');

    } catch (error) {
      console.error('[MailAI] generateReply error:', error);
      if (typeof Toast !== 'undefined') Toast.error('Erreur lors de la génération');
      buttonEl.disabled = false;
      buttonEl.innerHTML = originalText;
    }
  },

  // =============================================
  // FEATURE 2 — PRIORITY TRIAGE
  // Analyse et classe les emails en une requête
  // =============================================

  PRIORITY_CONFIG: {
    URGENT:   { label: 'Urgent',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    icon: '🔴' },
    CLIENT:   { label: 'Client',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   icon: '🟡' },
    FACTURE:  { label: 'Facture',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',   icon: '🟣' },
    QUESTION: { label: 'Question', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',   icon: '🔵' },
    INFO:     { label: 'Info',     color: '#6b7280', bg: 'rgba(107,114,128,0.08)',  icon: '⚪' },
  },

  /**
   * Charge le cache depuis localStorage
   */
  loadCache() {
    try {
      const raw = localStorage.getItem('mailai_priority_cache');
      if (raw) this._priorityCache = JSON.parse(raw);
    } catch (e) { this._priorityCache = {}; }
  },

  saveCache() {
    try {
      localStorage.setItem('mailai_priority_cache', JSON.stringify(this._priorityCache));
    } catch (e) {}
  },

  /**
   * Analyse un batch d'emails et retourne leurs priorités
   * Une seule requête IA pour tous les emails
   */
  async analyzeEmailsBatch(emails) {
    if (!ApiAi || !ApiAi.isAvailable()) return {};
    if (!emails || emails.length === 0) return {};

    // Filter only emails not yet in cache
    const toAnalyze = emails.filter(e => !this._priorityCache[e.id]);
    if (toAnalyze.length === 0) return this._priorityCache;

    const emailList = toAnalyze.map(e => ({
      id: e.id,
      from: e.from_name || e.from_address || 'inconnu',
      subject: e.subject || '(sans objet)',
      preview: ((e.body_text || '').replace(/\\n/g, ' ').substring(0, 150))
    }));

    const prompt = `Analyse ces emails et classe chacun avec une seule priorité parmi: URGENT, CLIENT, FACTURE, QUESTION, INFO.

Règles:
- URGENT: deadline, problème critique, demande urgente, ASAP
- CLIENT: email d'un client ou prospect, demande commerciale
- FACTURE: paiement, facture, devis, comptabilité
- QUESTION: question directe qui attend une réponse
- INFO: information, newsletter, confirmation, notification

Emails à analyser:
${JSON.stringify(emailList, null, 2)}

Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans explication:
[{"id": "id_email", "priority": "URGENT|CLIENT|FACTURE|QUESTION|INFO"}]`;

    try {
      const raw = await ApiAi.generate(prompt,
        'Tu es un assistant de triage email. Tu retournes UNIQUEMENT du JSON valide, sans texte autour.'
      );

      // Parse JSON - extraire même si entouré de texte
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return this._priorityCache;

      const results = JSON.parse(jsonMatch[0]);
      results.forEach(r => {
        if (r.id && r.priority && this.PRIORITY_CONFIG[r.priority]) {
          this._priorityCache[r.id] = r.priority;
        }
      });

      this.saveCache();
      return this._priorityCache;

    } catch (error) {
      console.error('[MailAI] analyzeEmailsBatch error:', error);
      return this._priorityCache;
    }
  },

  /**
   * Retourne le badge HTML pour une priorité
   */
  renderPriorityBadge(emailId) {
    const priority = this._priorityCache[emailId];
    if (!priority) return '';
    const cfg = this.PRIORITY_CONFIG[priority];
    if (!cfg) return '';
    return `<span class="mail-ai-priority-badge"
      style="color:${cfg.color};background:${cfg.bg};border-color:${cfg.color}33"
      title="Priorité IA: ${cfg.label}">
      ${cfg.icon} ${cfg.label}
    </span>`;
  },

  // =============================================
  // FEATURE 3 — EXTRACT TASKS
  // Extrait les tâches depuis un email
  // =============================================

  /**
   * Extrait les tâches d'un email et affiche un modal de confirmation
   */
  async extractTasks(email, buttonEl) {
    if (!ApiAi || !ApiAi.isAvailable()) {
      if (typeof Toast !== 'undefined') Toast.error('IA non disponible');
      return;
    }

    const originalText = buttonEl.innerHTML;
    buttonEl.disabled = true;
    buttonEl.innerHTML = '<span class="mail-ai-spinner"></span> Analyse...';

    try {
      const fromName = email.from_name || email.from_address || 'l\'expéditeur';
      const bodyText = (email.body_text || email.body_html || '')
        .replace(/<[^>]*>/g, '')
        .replace(/\\n/g, '\n')
        .substring(0, 1500);

      const today = new Date().toISOString().split('T')[0];
      const prompt = `Extrait toutes les actions à faire depuis cet email. Retourne UNIQUEMENT un tableau JSON.

Email:
De: ${fromName}
Sujet: ${email.subject || ''}
Corps: ${bodyText}

Date du jour: ${today}

Format JSON attendu (sans markdown, JSON pur):
[{"title": "description de la tâche", "priority": "high|medium|low", "dueDate": "YYYY-MM-DD ou null"}]

Si aucune tâche n'est détectée, retourne: []`;

      const raw = await ApiAi.generate(prompt,
        'Tu es un assistant de productivité. Tu extrais uniquement les tâches actionnables. Tu retournes UNIQUEMENT du JSON valide.'
      );

      buttonEl.disabled = false;
      buttonEl.innerHTML = originalText;

      // Parse JSON
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      const tasks = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      if (tasks.length === 0) {
        if (typeof Toast !== 'undefined') Toast.info('Aucune tâche détectée dans cet email');
        return;
      }

      this.showTaskConfirmModal(tasks, email);

    } catch (error) {
      console.error('[MailAI] extractTasks error:', error);
      buttonEl.disabled = false;
      buttonEl.innerHTML = originalText;
      if (typeof Toast !== 'undefined') Toast.error('Erreur lors de l\'extraction');
    }
  },

  /**
   * Modal de confirmation des tâches extraites
   */
  showTaskConfirmModal(tasks, email) {
    const priorityLabels = { high: '🔴 Haute', medium: '🟡 Moyenne', low: '🟢 Basse' };

    const modal = document.createElement('div');
    modal.className = 'mail-modal-overlay mail-ai-task-overlay';
    modal.innerHTML = `
      <div class="mail-modal mail-ai-task-modal">
        <div class="mail-modal-header">
          <div class="mail-ai-modal-title">
            <span class="mail-ai-icon">✅</span>
            <div>
              <h3>${tasks.length} tâche${tasks.length > 1 ? 's' : ''} extraite${tasks.length > 1 ? 's' : ''}</h3>
              <p class="mail-ai-modal-subtitle">Depuis : ${MailUtils.escapeHtml(email.subject || '(sans objet)')}</p>
            </div>
          </div>
          <button class="mail-modal-close">×</button>
        </div>
        <div class="mail-modal-body">
          <div class="mail-ai-tasks-list">
            ${tasks.map((task, i) => `
              <div class="mail-ai-task-item" data-index="${i}">
                <label class="mail-ai-task-check">
                  <input type="checkbox" checked data-index="${i}">
                  <span class="mail-ai-checkmark"></span>
                </label>
                <div class="mail-ai-task-body">
                  <input type="text" class="mail-ai-task-title" value="${MailUtils.escapeHtml(task.title)}" data-index="${i}">
                  <div class="mail-ai-task-meta">
                    <span class="mail-ai-task-priority">${priorityLabels[task.priority] || '🟡 Moyenne'}</span>
                    ${task.dueDate ? `<span class="mail-ai-task-date">📅 ${task.dueDate}</span>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="mail-modal-footer">
          <span class="mail-ai-footer-note">Les tâches cochées seront ajoutées à votre liste</span>
          <div class="mail-ai-footer-actions">
            <button class="btn btn-outline mail-modal-close">Annuler</button>
            <button class="btn btn-primary" id="mail-ai-create-tasks">
              ✅ Créer les tâches
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    modal.querySelectorAll('.mail-modal-close').forEach(btn =>
      btn.addEventListener('click', () => modal.remove())
    );
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.remove();
    });

    // Create tasks handler
    document.getElementById('mail-ai-create-tasks').addEventListener('click', async () => {
      const checkedItems = modal.querySelectorAll('input[type="checkbox"]:checked');
      const tasksToCreate = [];

      checkedItems.forEach(checkbox => {
        const idx = parseInt(checkbox.dataset.index);
        const titleInput = modal.querySelector(`.mail-ai-task-title[data-index="${idx}"]`);
        const task = tasks[idx];
        if (titleInput && task) {
          tasksToCreate.push({
            title: titleInput.value.trim(),
            priority: task.priority || 'medium',
            dueDate: task.dueDate || null
          });
        }
      });

      if (tasksToCreate.length === 0) {
        modal.remove();
        return;
      }

      await this.createTasks(tasksToCreate, modal);
    });
  },

  /**
   * Crée les tâches via l'API backend
   */
  async createTasks(tasks, modal) {
    const btn = document.getElementById('mail-ai-create-tasks');
    if (btn) { btn.disabled = true; btn.textContent = 'Création...'; }

    let created = 0;
    for (const task of tasks) {
      try {
        await Api.post('/tasks', {
          title: task.title,
          priority: task.priority === 'high' ? 1 : task.priority === 'low' ? 3 : 2,
          due_date: task.dueDate || null,
          status: 'todo'
        });
        created++;
      } catch (error) {
        console.error('[MailAI] createTask error:', error);
      }
    }

    modal.remove();

    if (created > 0) {
      if (typeof Toast !== 'undefined')
        Toast.success(`✅ ${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''} avec succès`);
      // Refresh tasks if on tasks view
      if (typeof Tasks !== 'undefined' && typeof Tasks.load === 'function') {
        setTimeout(() => Tasks.load(), 500);
      }
    }
  }
};

// Charger le cache au démarrage
MailAI.loadCache();

window.MailAI = MailAI;
