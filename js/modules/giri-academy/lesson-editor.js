/**
 * LESSON EDITOR v1.0
 * Modal d'édition d'une leçon (Vidéo, Texte, PDF, Quiz)
 */

const LessonEditor = (function () {
    'use strict';

    let _currentLesson = null;
    let _quizQuestions = [];

    function open(lesson, onSave) {
        _currentLesson = lesson || {};
        _quizQuestions = lesson?.quiz_questions ? JSON.parse(JSON.stringify(lesson.quiz_questions)) : [];

        const overlay = document.createElement('div');
        overlay.className = 'academy-modal-overlay';
        overlay.id = 'lesson-editor-overlay';
        overlay.innerHTML = _buildModal(lesson);
        document.body.appendChild(overlay);

        _initModal(overlay, onSave);
    }

    function _buildModal(lesson) {
        const type = lesson?.type || 'video';
        return `
        <div class="academy-modal">
            <div class="academy-modal-header">
                <h3 class="academy-modal-title">${lesson?.id ? '✏️ Modifier la leçon' : '➕ Nouvelle leçon'}</h3>
                <button class="academy-modal-close" id="lesson-modal-close">✕</button>
            </div>
            <div class="academy-modal-body">
                <div class="form-group">
                    <label class="form-label">Titre de la leçon *</label>
                    <input type="text" class="form-control" id="lesson-title" value="${_esc(lesson?.title || '')}" placeholder="ex: Introduction à la respiration">
                </div>

                <div class="form-group">
                    <label class="form-label">Type de contenu</label>
                    <div class="lesson-type-tabs" id="lesson-type-tabs">
                        ${_buildTypeTabs(type)}
                    </div>
                </div>

                <div id="lesson-content-area">
                    ${_buildContentArea(type, lesson)}
                </div>

                <div class="form-group" style="margin-top:16px">
                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:14px;color:var(--text)">
                        <input type="checkbox" id="lesson-preview" ${lesson?.is_preview ? 'checked' : ''} style="accent-color:#7c3aed;width:16px;height:16px">
                        <span>Disponible en aperçu gratuit</span>
                    </label>
                    <p style="font-size:12px;color:var(--text-muted);margin:4px 0 0 26px">Les visiteurs pourront accéder à cette leçon sans acheter la formation</p>
                </div>

                <div class="form-group">
                    <label class="form-label">Durée estimée (minutes)</label>
                    <input type="number" class="form-control" id="lesson-duration" value="${lesson?.duration_minutes || ''}" placeholder="ex: 15" min="1" max="300" style="max-width:140px">
                </div>
            </div>
            <div class="academy-modal-footer">
                <button class="btn-academy btn-secondary" id="lesson-cancel">Annuler</button>
                <button class="btn-academy btn-primary" id="lesson-save">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Enregistrer
                </button>
            </div>
        </div>`;
    }

    function _buildTypeTabs(activeType) {
        const types = [
            { id: 'video', icon: '🎬', label: 'Vidéo' },
            { id: 'text', icon: '📝', label: 'Texte' },
            { id: 'pdf', icon: '📄', label: 'PDF' },
            { id: 'quiz', icon: '❓', label: 'Quiz' }
        ];
        return types.map(t => `
            <button class="lesson-type-tab ${t.id === activeType ? 'active' : ''}" data-type="${t.id}">
                <span class="tab-icon">${t.icon}</span>${t.label}
            </button>`).join('');
    }

    function _buildContentArea(type, lesson) {
        switch (type) {
            case 'video':   return _buildVideoContent(lesson);
            case 'text':    return _buildTextContent(lesson);
            case 'pdf':     return _buildPdfContent(lesson);
            case 'quiz':    return _buildQuizContent(lesson);
            default:        return _buildVideoContent(lesson);
        }
    }

    function _buildVideoContent(lesson) {
        const source = lesson?.video_source || 'upload';
        const url = lesson?.video_url || '';
        return `
        <div class="form-group">
            <label class="form-label">Source vidéo</label>
            <div style="display:flex;gap:8px;margin-bottom:14px">
                <button class="btn-academy btn-secondary btn-sm ${source !== 'url' ? 'btn-primary' : ''}" id="video-src-upload" style="flex:1">⬆️ Upload fichier</button>
                <button class="btn-academy btn-secondary btn-sm ${source === 'url' ? 'btn-primary' : ''}" id="video-src-url" style="flex:1">🔗 URL YouTube/Vimeo</button>
            </div>
            <div id="video-upload-zone" style="${source === 'url' ? 'display:none' : ''}">
                ${url && source !== 'url' ? `<div style="padding:12px;background:var(--bg-tertiary);border-radius:8px;font-size:13px;color:var(--text-muted);margin-bottom:8px">Fichier actuel: <strong>${url.split('/').pop()}</strong></div>` : ''}
                <div class="upload-zone" id="video-drop-zone">
                    <div class="upload-zone-icon">🎬</div>
                    <p style="margin:0 0 6px;font-weight:600">Glissez votre vidéo ici</p>
                    <p style="margin:0;font-size:12px">ou <label style="color:#a78bfa;cursor:pointer"><input type="file" id="video-file-input" accept="video/*" style="display:none">parcourir les fichiers</label></p>
                    <p style="margin:8px 0 0;font-size:11px;opacity:0.6">MP4, MOV, AVI — max 2GB</p>
                </div>
                <div class="upload-progress" id="video-progress-wrap" style="display:none">
                    <div class="upload-progress-bar" id="video-progress-bar"></div>
                </div>
                <input type="hidden" id="video-url-hidden" value="${url}">
            </div>
            <div id="video-url-zone" style="${source === 'url' ? '' : 'display:none'}">
                <input type="url" class="form-control" id="video-url-input" value="${source === 'url' ? url : ''}" placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/...">
                <p style="font-size:12px;color:var(--text-muted);margin-top:6px">Collez l'URL complète de votre vidéo YouTube ou Vimeo</p>
            </div>
        </div>`;
    }

    function _buildTextContent(lesson) {
        return `
        <div class="form-group">
            <label class="form-label">Contenu (Markdown supporté)</label>
            <textarea class="form-control" id="lesson-text-content" rows="10" placeholder="# Titre\n\nVotre contenu ici...\n\n## Sous-titre\n\nParagraphe...">${_esc(lesson?.text_content || '')}</textarea>
            <p style="font-size:12px;color:var(--text-muted);margin-top:6px">Supporte le **gras**, *italique*, # titres, - listes, [liens](url)</p>
        </div>`;
    }

    function _buildPdfContent(lesson) {
        const url = lesson?.pdf_url || '';
        return `
        <div class="form-group">
            <label class="form-label">Fichier PDF</label>
            ${url ? `<div style="padding:12px;background:var(--bg-tertiary);border-radius:8px;font-size:13px;color:var(--text-muted);margin-bottom:8px">PDF actuel: <strong>${url.split('/').pop()}</strong></div>` : ''}
            <div class="upload-zone" id="pdf-drop-zone">
                <div class="upload-zone-icon">📄</div>
                <p style="margin:0 0 6px;font-weight:600">Glissez votre PDF ici</p>
                <p style="margin:0;font-size:12px">ou <label style="color:#a78bfa;cursor:pointer"><input type="file" id="pdf-file-input" accept=".pdf" style="display:none">parcourir les fichiers</label></p>
                <p style="margin:8px 0 0;font-size:11px;opacity:0.6">PDF uniquement — max 50MB</p>
            </div>
            <div class="upload-progress" id="pdf-progress-wrap" style="display:none">
                <div class="upload-progress-bar" id="pdf-progress-bar"></div>
            </div>
            <input type="hidden" id="pdf-url-hidden" value="${url}">
        </div>`;
    }

    function _buildQuizContent(lesson) {
        const questions = lesson?.quiz_questions || _quizQuestions;
        return `
        <div id="quiz-builder">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <label class="form-label" style="margin:0">Questions du quiz</label>
                <button class="btn-academy btn-secondary btn-sm" id="add-quiz-question">+ Ajouter une question</button>
            </div>
            <div id="quiz-questions-list">
                ${questions.map((q, i) => _buildQuizQuestion(q, i)).join('') || '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px">Aucune question. Cliquez sur "+ Ajouter" pour commencer.</p>'}
            </div>
        </div>`;
    }

    function _buildQuizQuestion(q, index) {
        const options = q.options || ['', '', '', ''];
        return `
        <div class="quiz-question" data-qindex="${index}">
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
                <span style="font-size:13px;font-weight:600;color:var(--text-muted)">Question ${index + 1}</span>
                <button class="btn-academy btn-danger btn-sm btn-remove-question" data-index="${index}">✕</button>
            </div>
            <input type="text" class="form-control" placeholder="Question..." value="${_esc(q.question || '')}" style="margin-bottom:10px" data-field="question" data-qindex="${index}">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">Options (cochez la bonne réponse) :</div>
            ${options.map((opt, oi) => `
            <div class="quiz-option">
                <input type="radio" name="correct-${index}" value="${oi}" ${q.correct_index === oi ? 'checked' : ''} data-qindex="${index}" data-oi="${oi}">
                <input type="text" class="form-control" placeholder="Option ${oi + 1}" value="${_esc(opt)}" data-field="option" data-qindex="${index}" data-oi="${oi}" style="flex:1">
            </div>`).join('')}
            <div style="margin-top:8px">
                <input type="text" class="form-control" placeholder="Explication (optionnel)" value="${_esc(q.explanation || '')}" data-field="explanation" data-qindex="${index}" style="font-size:12px">
            </div>
        </div>`;
    }

    function _initModal(overlay, onSave) {
        overlay.querySelector('#lesson-modal-close').onclick = () => overlay.remove();
        overlay.querySelector('#lesson-cancel').onclick = () => overlay.remove();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        // Type tabs switching
        overlay.querySelectorAll('.lesson-type-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                overlay.querySelectorAll('.lesson-type-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const type = tab.dataset.type;
                const area = overlay.querySelector('#lesson-content-area');
                const fakeLesson = { ...(_currentLesson || {}), type };
                area.innerHTML = _buildContentArea(type, fakeLesson);
                _initContentEvents(overlay, type);
            });
        });

        const activeType = overlay.querySelector('.lesson-type-tab.active')?.dataset.type || 'video';
        _initContentEvents(overlay, activeType);

        // Save
        overlay.querySelector('#lesson-save').onclick = async () => {
            const title = overlay.querySelector('#lesson-title')?.value.trim();
            if (!title) { overlay.querySelector('#lesson-title').focus(); return; }

            const activeTab = overlay.querySelector('.lesson-type-tab.active');
            const type = activeTab?.dataset.type || 'video';
            const data = _gatherData(overlay, type, title);

            const btn = overlay.querySelector('#lesson-save');
            btn.disabled = true;
            btn.textContent = 'Enregistrement...';

            try {
                if (onSave) await onSave(data);
                overlay.remove();
            } catch (err) {
                btn.disabled = false;
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Enregistrer';
                alert('Erreur: ' + (err.message || 'Impossible d\'enregistrer'));
            }
        };
    }

    function _initContentEvents(overlay, type) {
        if (type === 'video') _initVideoEvents(overlay);
        if (type === 'pdf') _initPdfEvents(overlay);
        if (type === 'quiz') _initQuizEvents(overlay);
    }

    function _initVideoEvents(overlay) {
        const uploadBtn = overlay.querySelector('#video-src-upload');
        const urlBtn = overlay.querySelector('#video-src-url');
        const uploadZone = overlay.querySelector('#video-upload-zone');
        const urlZone = overlay.querySelector('#video-url-zone');

        if (!uploadBtn) return;

        uploadBtn.onclick = () => {
            uploadZone.style.display = '';
            urlZone.style.display = 'none';
            uploadBtn.classList.add('btn-primary');
            urlBtn.classList.remove('btn-primary');
        };

        urlBtn.onclick = () => {
            urlZone.style.display = '';
            uploadZone.style.display = 'none';
            urlBtn.classList.add('btn-primary');
            uploadBtn.classList.remove('btn-primary');
        };

        const fileInput = overlay.querySelector('#video-file-input');
        const dropZone = overlay.querySelector('#video-drop-zone');
        if (fileInput && dropZone) {
            _setupFileUpload(fileInput, dropZone, overlay.querySelector('#video-progress-wrap'),
                overlay.querySelector('#video-progress-bar'), overlay.querySelector('#video-url-hidden'), 'video');
        }
    }

    function _initPdfEvents(overlay) {
        const fileInput = overlay.querySelector('#pdf-file-input');
        const dropZone = overlay.querySelector('#pdf-drop-zone');
        if (fileInput && dropZone) {
            _setupFileUpload(fileInput, dropZone, overlay.querySelector('#pdf-progress-wrap'),
                overlay.querySelector('#pdf-progress-bar'), overlay.querySelector('#pdf-url-hidden'), 'pdf');
        }
    }

    function _setupFileUpload(input, dropZone, progressWrap, progressBar, hidden, context) {
        const handleFile = async (file) => {
            if (!file) return;
            progressWrap.style.display = '';
            try {
                const url = await AcademyApi.uploadFile(file, context, (pct) => {
                    progressBar.style.width = pct + '%';
                });
                hidden.value = url;
                progressBar.style.width = '100%';
                const label = dropZone.querySelector('p');
                if (label) label.textContent = '✅ ' + file.name;
            } catch (err) {
                alert('Erreur upload: ' + (err.message || ''));
                progressWrap.style.display = 'none';
            }
        };

        input.addEventListener('change', () => handleFile(input.files[0]));
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-active'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-active'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-active');
            handleFile(e.dataTransfer.files[0]);
        });
    }

    function _initQuizEvents(overlay) {
        const addBtn = overlay.querySelector('#add-quiz-question');
        if (!addBtn) return;

        addBtn.onclick = () => {
            _quizQuestions.push({ question: '', options: ['', '', '', ''], correct_index: 0, explanation: '' });
            const list = overlay.querySelector('#quiz-questions-list');
            list.innerHTML = _quizQuestions.map((q, i) => _buildQuizQuestion(q, i)).join('');
            _initQuizEvents(overlay);
        };

        overlay.querySelectorAll('.btn-remove-question').forEach(btn => {
            btn.onclick = () => {
                _quizQuestions.splice(parseInt(btn.dataset.index), 1);
                const list = overlay.querySelector('#quiz-questions-list');
                list.innerHTML = _quizQuestions.length
                    ? _quizQuestions.map((q, i) => _buildQuizQuestion(q, i)).join('')
                    : '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px">Aucune question.</p>';
                _initQuizEvents(overlay);
            };
        });

        overlay.querySelectorAll('[data-field]').forEach(el => {
            el.addEventListener('input', () => {
                const qi = parseInt(el.dataset.qindex);
                const field = el.dataset.field;
                if (!_quizQuestions[qi]) return;
                if (field === 'question') _quizQuestions[qi].question = el.value;
                if (field === 'option') _quizQuestions[qi].options[parseInt(el.dataset.oi)] = el.value;
                if (field === 'explanation') _quizQuestions[qi].explanation = el.value;
            });
        });

        overlay.querySelectorAll('input[type="radio"][name^="correct-"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const qi = parseInt(radio.dataset.qindex);
                if (_quizQuestions[qi]) _quizQuestions[qi].correct_index = parseInt(radio.value);
            });
        });
    }

    function _gatherData(overlay, type, title) {
        const data = {
            title,
            type,
            is_preview: overlay.querySelector('#lesson-preview')?.checked || false,
            duration_minutes: parseInt(overlay.querySelector('#lesson-duration')?.value) || null
        };

        if (type === 'video') {
            const urlZone = overlay.querySelector('#video-url-zone');
            if (urlZone && urlZone.style.display !== 'none') {
                data.video_url = overlay.querySelector('#video-url-input')?.value.trim() || '';
                data.video_source = 'url';
            } else {
                data.video_url = overlay.querySelector('#video-url-hidden')?.value || '';
                data.video_source = 'upload';
            }
        } else if (type === 'text') {
            data.text_content = overlay.querySelector('#lesson-text-content')?.value || '';
        } else if (type === 'pdf') {
            data.pdf_url = overlay.querySelector('#pdf-url-hidden')?.value || '';
        } else if (type === 'quiz') {
            data.quiz_questions = JSON.parse(JSON.stringify(_quizQuestions));
        }

        return data;
    }

    function _esc(s) {
        const d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
    }

    return { open };
})();

if (typeof window !== 'undefined') window.LessonEditor = LessonEditor;
