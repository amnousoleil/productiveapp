/**
 * GIRI ACADEMY API v1.0
 * Couche de données — Formations, Modules, Leçons, Étudiants
 */

const AcademyApi = (function () {
    'use strict';

    function base() {
        return `/formations`;
    }

    // ── Formations ─────────────────────────────────────────────

    async function listFormations() {
        const r = await Api.get(base());
        return Array.isArray(r) ? r : (r.data || r.formations || []);
    }

    async function getFormation(id) {
        const r = await Api.get(`${base()}/${id}`);
        return r.data || r.formation || r;
    }

    async function createFormation(data) {
        const r = await Api.post(base(), data);
        return r.data || r.formation || r;
    }

    async function updateFormation(id, data) {
        const r = await Api.put(`${base()}/${id}`, data);
        return r.data || r.formation || r;
    }

    async function deleteFormation(id) {
        return Api.delete(`${base()}/${id}`);
    }

    async function publishFormation(id) {
        return Api.post(`${base()}/${id}/publish`, {});
    }

    async function unpublishFormation(id) {
        return Api.post(`${base()}/${id}/unpublish`, {});
    }

    // ── Modules ────────────────────────────────────────────────

    async function createModule(formationId, data) {
        const r = await Api.post(`${base()}/${formationId}/modules`, data);
        return r.data || r.module || r;
    }

    async function updateModule(formationId, moduleId, data) {
        const r = await Api.put(`${base()}/${formationId}/modules/${moduleId}`, data);
        return r.data || r.module || r;
    }

    async function deleteModule(formationId, moduleId) {
        return Api.delete(`${base()}/${formationId}/modules/${moduleId}`);
    }

    async function reorderModules(formationId, orderedIds) {
        return Api.put(`${base()}/${formationId}/modules/reorder`, { order: orderedIds });
    }

    // ── Leçons ─────────────────────────────────────────────────

    async function createLesson(formationId, moduleId, data) {
        const r = await Api.post(`${base()}/${formationId}/modules/${moduleId}/lessons`, data);
        return r.data || r.lesson || r;
    }

    async function updateLesson(formationId, moduleId, lessonId, data) {
        const r = await Api.put(`${base()}/${formationId}/modules/${moduleId}/lessons/${lessonId}`, data);
        return r.data || r.lesson || r;
    }

    async function deleteLesson(formationId, moduleId, lessonId) {
        return Api.delete(`${base()}/${formationId}/modules/${moduleId}/lessons/${lessonId}`);
    }

    async function reorderLessons(formationId, moduleId, orderedIds) {
        return Api.put(`${base()}/${formationId}/modules/${moduleId}/lessons/reorder`, { order: orderedIds });
    }

    // ── Étudiants ──────────────────────────────────────────────

    async function listStudents(formationId, params = {}) {
        const query = new URLSearchParams(params).toString();
        const r = await Api.get(`${base()}/${formationId}/students${query ? '?' + query : ''}`);
        return Array.isArray(r) ? r : (r.data || r.students || []);
    }

    async function addStudent(formationId, data) {
        const r = await Api.post(`${base()}/${formationId}/students`, data);
        return r.data || r.student || r;
    }

    async function removeStudent(formationId, studentId) {
        return Api.delete(`${base()}/${formationId}/students/${studentId}`);
    }

    // ── Stats ──────────────────────────────────────────────────

    async function getStats(formationId) {
        const r = await Api.get(`${base()}/${formationId}/stats`);
        return r.data || r.stats || r;
    }

    // ── Quiz ───────────────────────────────────────────────────

    async function getQuizByLesson(lessonId) {
        try { return await Api.get(`/quizzes/lesson/${lessonId}`); }
        catch { return null; }
    }

    async function saveQuiz(lessonId, settings, questions, existingQuiz) {
        let quizId;
        if (existingQuiz && existingQuiz.id) {
            await Api.put(`/quizzes/${existingQuiz.id}`, settings);
            quizId = existingQuiz.id;
        } else {
            const created = await Api.post(`/quizzes/lesson/${lessonId}`, { title: 'Quiz', ...settings });
            quizId = created.id || created.data?.id;
        }

        const existingIds = (existingQuiz?.questions || []).map(q => q.id);
        const keptIds = questions.filter(q => q._id).map(q => q._id);
        for (const id of existingIds) {
            if (!keptIds.includes(id)) {
                await Api.delete(`/quizzes/${quizId}/questions/${id}`);
            }
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const payload = {
                question: q.question,
                question_type: q.question_type || 'single',
                options: q.options || [],
                explanation: q.explanation || null,
                points: q.points || 1,
                position: i,
            };
            if (q._id) {
                await Api.put(`/quizzes/${quizId}/questions/${q._id}`, payload);
            } else {
                await Api.post(`/quizzes/${quizId}/questions`, payload);
            }
        }
        return quizId;
    }

    // ── Storage (Upload via multer local — 200MB PDF/vidéo) ────

    async function uploadFile(file, _context, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const result = JSON.parse(xhr.responseText);
                        if (result.success && result.url) {
                            resolve(result.url);
                        } else {
                            reject(new Error(result.error || 'Upload échoué'));
                        }
                    } catch (e) {
                        reject(new Error('Réponse invalide du serveur'));
                    }
                } else {
                    reject(new Error('Erreur upload HTTP ' + xhr.status));
                }
            };

            xhr.onerror = () => reject(new Error('Erreur réseau upload'));

            const token = (typeof ApiTokens !== 'undefined') ? ApiTokens.getAccessToken() : '';
            xhr.open('POST', '/api/v1/uploads/local');
            if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.send(formData);
        });
    }

    return {
        listFormations, getFormation, createFormation, updateFormation,
        deleteFormation, publishFormation, unpublishFormation,
        createModule, updateModule, deleteModule, reorderModules,
        createLesson, updateLesson, deleteLesson, reorderLessons,
        listStudents, addStudent, removeStudent,
        getStats,
        getQuizByLesson, saveQuiz,
        uploadFile, getPresignedUrl, confirmUpload
    };
})();

if (typeof window !== 'undefined') window.AcademyApi = AcademyApi;
