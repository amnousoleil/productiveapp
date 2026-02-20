/**
 * ================================================
 * TUNNEL API v1.0
 * Couche de données pour Tunnel Club
 * Utilise localStorage (prêt pour backend API)
 * ================================================
 */

const TunnelApi = (function() {
    'use strict';

    const STORAGE_KEY = 'productiveapp_tunnels_v1';
    const LEADS_KEY = 'productiveapp_tunnel_leads_v1';
    const PAYMENTS_KEY = 'productiveapp_tunnel_payments_v1';

    // Templates de pages par défaut selon le type de tunnel
    const PAGE_TEMPLATES = {
        capture: {
            hero: { type: 'hero', title: 'Obtenez [Résultat] en [Délai]', subtitle: 'Sans [Problème principal]', cta: 'Oui, je veux ça !' },
            form: { type: 'form', fields: ['prénom', 'email'], cta: 'Recevoir gratuitement' },
            social: { type: 'social', testimonials: [] }
        },
        vente: {
            hero: { type: 'hero', title: '[Nom du produit]', subtitle: 'La solution ultime pour...', cta: 'Acheter maintenant' },
            benefits: { type: 'benefits', items: [] },
            pricing: { type: 'pricing', price: 0, originalPrice: 0, currency: '€' },
            guarantee: { type: 'guarantee', days: 30, text: 'Remboursement 30 jours' },
            faq: { type: 'faq', items: [] }
        },
        checkout: {
            form: { type: 'checkout', fields: ['prénom', 'nom', 'email', 'carte'] },
            summary: { type: 'summary', showProduct: true }
        },
        merci: {
            confirmation: { type: 'confirmation', title: 'Merci !', message: 'Votre commande est confirmée.' },
            nextStep: { type: 'nextstep', cta: 'Accéder à votre achat', url: '' }
        }
    };

    // Données de test
    const DEMO_TUNNELS = [
        {
            id: 'demo-1',
            name: 'Formation Productivité Pro',
            product: 'Formation en ligne',
            description: 'Doublez votre productivité en 30 jours',
            status: 'published',
            color: '#6366f1',
            icon: '🚀',
            style: 'moderne',
            price: 197,
            currency: '€',
            pages: ['capture', 'vente', 'checkout', 'merci'],
            currentPage: 'capture',
            content: {},
            stats: { visits: 1247, leads: 312, sales: 47, revenue: 9259 },
            payments: { stripe: true, paypal: false, whatsapp: false },
            url: 'formation-productivite-pro',
            createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'demo-2',
            name: 'Coaching Business Mindset',
            product: 'Session 1-to-1',
            description: 'Transformez votre état d\'esprit, transformez vos résultats',
            status: 'draft',
            color: '#f59e0b',
            icon: '🧠',
            style: 'elegant',
            price: 497,
            currency: '€',
            pages: ['capture', 'vente', 'checkout', 'merci'],
            currentPage: 'capture',
            content: {},
            stats: { visits: 0, leads: 0, sales: 0, revenue: 0 },
            payments: { stripe: false, paypal: false, whatsapp: true },
            url: 'coaching-business-mindset',
            createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    // ──────────────────────────────────────────
    // TUNNELS CRUD
    // ──────────────────────────────────────────

    function _load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        // Initialiser avec données démo
        const demos = DEMO_TUNNELS;
        _save(demos);
        return demos;
    }

    function _save(tunnels) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tunnels));
        } catch (e) {
            console.warn('TunnelApi: Failed to save tunnels', e);
        }
    }

    function getAll() {
        return Promise.resolve(_load());
    }

    function getById(id) {
        const tunnels = _load();
        const tunnel = tunnels.find(t => t.id === id);
        return Promise.resolve(tunnel || null);
    }

    function create(data) {
        const tunnels = _load();
        const newTunnel = {
            id: 'tc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            name: data.name || 'Nouveau tunnel',
            product: data.product || '',
            description: data.description || '',
            status: 'draft',
            color: data.color || '#6366f1',
            icon: data.icon || '🚀',
            style: data.style || 'moderne',
            price: data.price || 0,
            currency: data.currency || '€',
            audience: data.audience || '',
            tone: data.tone || 'professionnel',
            pages: ['capture', 'vente', 'checkout', 'merci'],
            currentPage: 'capture',
            content: _generateDefaultContent(data),
            stats: { visits: 0, leads: 0, sales: 0, revenue: 0 },
            payments: { stripe: false, paypal: false, whatsapp: false },
            url: _slugify(data.name || 'nouveau-tunnel'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        tunnels.unshift(newTunnel);
        _save(tunnels);
        return Promise.resolve(newTunnel);
    }

    function update(id, data) {
        const tunnels = _load();
        const idx = tunnels.findIndex(t => t.id === id);
        if (idx === -1) return Promise.reject(new Error('Tunnel introuvable'));
        tunnels[idx] = { ...tunnels[idx], ...data, updatedAt: new Date().toISOString() };
        _save(tunnels);
        return Promise.resolve(tunnels[idx]);
    }

    function remove(id) {
        const tunnels = _load();
        const filtered = tunnels.filter(t => t.id !== id);
        _save(filtered);
        // Supprimer les leads liés
        const leads = _loadLeads().filter(l => l.tunnelId !== id);
        _saveLeads(leads);
        return Promise.resolve({ success: true });
    }

    function publish(id) {
        return update(id, { status: 'published' });
    }

    function pause(id) {
        return update(id, { status: 'paused' });
    }

    function duplicate(id) {
        return getById(id).then(tunnel => {
            if (!tunnel) return Promise.reject(new Error('Tunnel introuvable'));
            const newData = {
                ...tunnel,
                name: tunnel.name + ' (copie)',
                status: 'draft',
                stats: { visits: 0, leads: 0, sales: 0, revenue: 0 },
                url: tunnel.url + '-copie'
            };
            delete newData.id;
            return create(newData);
        });
    }

    // ──────────────────────────────────────────
    // LEADS
    // ──────────────────────────────────────────

    function _loadLeads() {
        try {
            const raw = localStorage.getItem(LEADS_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return _generateDemoLeads();
    }

    function _saveLeads(leads) {
        try { localStorage.setItem(LEADS_KEY, JSON.stringify(leads)); } catch (e) {}
    }

    function _generateDemoLeads() {
        const names = ['Marie Dupont', 'Jean Martin', 'Sophie Bernard', 'Lucas Petit', 'Emma Moreau'];
        const leads = names.map((name, i) => ({
            id: 'lead-' + i,
            tunnelId: 'demo-1',
            name,
            email: name.toLowerCase().replace(' ', '.') + '@gmail.com',
            source: ['Organique', 'Publicité', 'Référence'][i % 3],
            status: ['nouveau', 'qualifié', 'client'][i % 3],
            value: i % 3 === 2 ? 197 : 0,
            createdAt: new Date(Date.now() - i * 24 * 3600000).toISOString()
        }));
        _saveLeads(leads);
        return leads;
    }

    function getLeads(tunnelId) {
        const leads = _loadLeads();
        return Promise.resolve(tunnelId ? leads.filter(l => l.tunnelId === tunnelId) : leads);
    }

    function addLead(data) {
        const leads = _loadLeads();
        const lead = {
            id: 'lead-' + Date.now(),
            ...data,
            createdAt: new Date().toISOString()
        };
        leads.unshift(lead);
        _saveLeads(leads);
        // Incrémenter le compteur
        if (data.tunnelId) {
            getById(data.tunnelId).then(tunnel => {
                if (tunnel) {
                    update(data.tunnelId, {
                        stats: { ...tunnel.stats, leads: (tunnel.stats.leads || 0) + 1 }
                    });
                }
            });
        }
        return Promise.resolve(lead);
    }

    // ──────────────────────────────────────────
    // STATS GLOBALES
    // ──────────────────────────────────────────

    function getGlobalStats() {
        const tunnels = _load();
        const leads = _loadLeads();
        const total = tunnels.reduce((acc, t) => ({
            tunnels: acc.tunnels + 1,
            visits: acc.visits + (t.stats?.visits || 0),
            leads: acc.leads + (t.stats?.leads || 0),
            sales: acc.sales + (t.stats?.sales || 0),
            revenue: acc.revenue + (t.stats?.revenue || 0)
        }), { tunnels: 0, visits: 0, leads: 0, sales: 0, revenue: 0 });

        const conversionRate = total.visits > 0
            ? ((total.leads / total.visits) * 100).toFixed(1)
            : 0;

        return Promise.resolve({
            ...total,
            conversionRate,
            published: tunnels.filter(t => t.status === 'published').length,
            draft: tunnels.filter(t => t.status === 'draft').length
        });
    }

    // ──────────────────────────────────────────
    // PAIEMENTS
    // ──────────────────────────────────────────

    function getPaymentConfig(tunnelId) {
        try {
            const raw = localStorage.getItem(PAYMENTS_KEY);
            if (raw) {
                const configs = JSON.parse(raw);
                return Promise.resolve(configs[tunnelId] || _defaultPaymentConfig());
            }
        } catch (e) {}
        return Promise.resolve(_defaultPaymentConfig());
    }

    function savePaymentConfig(tunnelId, config) {
        try {
            const raw = localStorage.getItem(PAYMENTS_KEY);
            const configs = raw ? JSON.parse(raw) : {};
            configs[tunnelId] = config;
            localStorage.setItem(PAYMENTS_KEY, JSON.stringify(configs));
        } catch (e) {}
        return Promise.resolve(config);
    }

    function _defaultPaymentConfig() {
        return {
            stripe: { connected: false, publicKey: '', mode: 'test' },
            paypal: { connected: false, clientId: '' },
            whatsapp: { connected: false, phone: '', message: 'Bonjour, je souhaite commander {product}' }
        };
    }

    // ──────────────────────────────────────────
    // IA — Génération de contenu
    // ──────────────────────────────────────────

    async function generateWithAI(data) {
        // Si l'API IA est disponible, on l'utilise
        if (typeof ApiAi !== 'undefined') {
            const prompt = `Tu es un expert en copywriting et tunnels de vente.
Crée le contenu pour un tunnel de vente avec ces informations :
- Produit : ${data.product}
- Description : ${data.description}
- Prix : ${data.price}${data.currency}
- Audience cible : ${data.audience}
- Ton : ${data.tone}

Génère le contenu en JSON avec ces sections :
{
  "headline": "Titre accrocheur principal",
  "subheadline": "Sous-titre explicatif",
  "cta": "Texte du bouton d'appel à l'action",
  "benefits": ["avantage 1", "avantage 2", "avantage 3", "avantage 4"],
  "guarantee": "Texte de garantie",
  "faq": [{"q": "question", "a": "réponse"}],
  "emailSubject": "Sujet email de bienvenue",
  "emailBody": "Corps de l'email de bienvenue"
}

Réponds UNIQUEMENT avec le JSON valide.`;

            try {
                const resp = await ApiAi.generate(prompt);
                const text = resp?.data?.text || resp?.text || resp;
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                console.warn('TunnelApi: AI generation failed, using template', e);
            }
        }

        // Fallback : contenu généré localement
        return _generateFallbackContent(data);
    }

    function _generateFallbackContent(data) {
        const productName = data.product || 'votre produit';
        return {
            headline: `Découvrez ${productName} — ${data.description || 'La solution qui change tout'}`,
            subheadline: `Pour ${data.audience || 'ceux qui veulent aller plus loin'} qui veulent des résultats concrets`,
            cta: `Oui, je veux accéder à ${productName} →`,
            benefits: [
                'Résultats visibles dès les premiers jours',
                'Méthode testée et approuvée',
                'Support disponible 7j/7',
                'Accès immédiat dès l\'achat'
            ],
            guarantee: `Satisfait ou remboursé pendant 30 jours. Aucun risque pour vous.`,
            faq: [
                { q: `Est-ce que ${productName} me convient ?`, a: `${productName} est fait pour ${data.audience || 'toute personne motivée'} qui veut ${data.description || 'obtenir des résultats'}.` },
                { q: 'Comment accéder à ma commande ?', a: 'Vous recevez un email avec vos accès immédiatement après la commande.' },
                { q: 'Et si ça ne me convient pas ?', a: 'Vous êtes remboursé intégralement dans les 30 jours, sans poser de questions.' }
            ],
            emailSubject: `Bienvenue ! Voici votre accès à ${productName}`,
            emailBody: `Bonjour,\n\nMerci pour votre confiance !\n\nVoici votre accès à ${productName}...\n\nÀ votre succès,\nL'équipe`
        };
    }

    function _generateDefaultContent(data) {
        return {
            capture: PAGE_TEMPLATES.capture,
            vente: PAGE_TEMPLATES.vente,
            checkout: PAGE_TEMPLATES.checkout,
            merci: PAGE_TEMPLATES.merci
        };
    }

    // ──────────────────────────────────────────
    // UTILITAIRES
    // ──────────────────────────────────────────

    function _slugify(text) {
        return text
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // ──────────────────────────────────────────
    // PUBLIC API
    // ──────────────────────────────────────────

    return {
        getAll,
        getById,
        create,
        update,
        remove,
        publish,
        pause,
        duplicate,
        getLeads,
        addLead,
        getGlobalStats,
        getPaymentConfig,
        savePaymentConfig,
        generateWithAI,
        PAGE_TEMPLATES
    };

})();

window.TunnelApi = TunnelApi;
