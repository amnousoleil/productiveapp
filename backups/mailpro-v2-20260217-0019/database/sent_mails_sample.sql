--
-- PostgreSQL database dump
--

\restrict ZUUwebglc5p7NcKZxjtlr9ZBRkigT930Lv2xVK2tIFmfoKuWVxzBMs3aeR94Si0

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: sent_mails; Type: TABLE DATA; Schema: public; Owner: productive_user
--

INSERT INTO public.sent_mails VALUES
	('e8392c5f-e74e-449c-8e38-bd1c1a45ee39', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', '✅ Test ProductiveApp Mail System', '<h1>🎉 Test réussi!</h1><p>Le système mail ProductiveApp avec Resend fonctionne correctement.</p><p><strong>Features:</strong></p><ul><li>✅ Templates HTML professionnels</li><li>✅ Notifications automatiques</li><li>✅ Resend API intégration</li></ul>', true, NULL, 'failed', 'The giri.app domain is not verified. Please, add and verify your domain on https://resend.com/domains', NULL, NULL, '2026-02-12 04:28:17.393744', '2026-02-12 04:28:17.393744'),
	('15ef652d-4e19-41f5-873d-0ac75bd77394', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', 'test', 'test', true, NULL, 'failed', 'The giri.app domain is not verified. Please, add and verify your domain on https://resend.com/domains', NULL, NULL, '2026-02-12 04:30:28.167734', '2026-02-12 04:30:28.167734'),
	('a235b54e-a905-4c21-89f4-1e1e1d24e123', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', 'Test Mail', '<h1>Test</h1>', true, NULL, 'failed', 'You can only send testing emails to your own email address (fanderock3@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain.', NULL, NULL, '2026-02-12 04:33:37.422518', '2026-02-12 04:33:37.422518'),
	('4f88dd97-48d4-460e-add8-63ab88c5a81f', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', 'Test', '<h1>Test</h1>', true, NULL, 'failed', 'You can only send testing emails to your own email address (fanderock3@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain.', NULL, NULL, '2026-02-12 04:33:44.706719', '2026-02-12 04:33:44.706719'),
	('c7f5df18-1a97-45f6-b859-38ef9fb9b0f2', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{fanderock3@gmail.com}', '{}', '{}', '✅ ProductiveApp Mail System - Test Complet', '<h1 style=''color:#6366f1''>🎉 Système Mail Opérationnel!</h1><p>Le système de mail ProductiveApp avec Resend est maintenant pleinement fonctionnel.</p><h2>✅ Fonctionnalités implémentées:</h2><ul><li><strong>📧 5 Templates HTML professionnels</strong><br>Tâche assignée, Alerte échéance, Invitation réunion, Rapport AI, Bienvenue</li><li><strong>🔔 Notifications automatiques</strong><br>Hook intégré sur création de tâche</li><li><strong>🚀 API complète</strong><br>Envoi simple/HTML, Multi-destinataires, Pièces jointes, Templates</li><li><strong>📊 Database tracking</strong><br>Historique, Statistiques, Brouillons</li></ul><p style=''margin-top:30px;padding:20px;background:#10b981;color:white;border-radius:10px;text-align:center''><strong>✅ TEST RÉUSSI</strong></p><p style=''color:#666;font-size:12px''>Envoyé depuis ProductiveApp via Resend API</p>', true, 'bc0d7a23-95e2-4854-ad1f-a67aaa1a4a33', 'sent', NULL, NULL, NULL, '2026-02-12 04:37:48.056802', '2026-02-12 04:37:48.056802'),
	('0a2537a5-82e1-4903-ada1-a7ccd79727ed', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{fanderock3@gmail.com}', '{}', '{}', '👑 Bienvenue sur ProductiveApp, Test User !', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 50px 32px; text-align: center; }
        .logo { font-size: 64px; margin-bottom: 16px; }
        .header h1 { margin: 0; color: white; font-size: 32px; font-weight: 700; }
        .header p { margin: 12px 0 0; color: rgba(255,255,255,0.9); font-size: 18px; }
        .content { padding: 40px 32px; }
        .welcome-text { font-size: 18px; line-height: 1.8; color: #52525b; margin: 24px 0; }
        .features-grid { display: grid; gap: 20px; margin: 32px 0; }
        .feature-card { display: flex; align-items: flex-start; gap: 16px; padding: 20px; background: #fafafa; border-radius: 12px; }
        .feature-icon { font-size: 32px; flex-shrink: 0; }
        .feature-content h3 { margin: 0 0 8px; font-size: 16px; color: #18181b; }
        .feature-content p { margin: 0; color: #71717a; font-size: 14px; line-height: 1.5; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 700; font-size: 18px; margin-top: 32px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3); }
        .quick-start { background: #f0f9ff; border: 2px solid #0ea5e9; padding: 24px; border-radius: 12px; margin: 32px 0; }
        .quick-start h3 { margin: 0 0 16px; color: #0c4a6e; font-size: 18px; }
        .quick-start-list { margin: 0; padding: 0 0 0 20px; }
        .quick-start-list li { color: #0c4a6e; margin-bottom: 8px; line-height: 1.6; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">👑</div>
            <h1>Bienvenue sur ProductiveApp !</h1>
            <p>Votre nouvel espace de productivité</p>
        </div>

        <div class="content">
            <p class="welcome-text">
                Bonjour <strong>Test User</strong>,
            </p>
            <p class="welcome-text">
                Nous sommes ravis de vous accueillir dans <strong>ProductiveApp Team</strong> ! ProductiveApp est votre nouvel assistant de productivité tout-en-un, conçu pour vous aider à accomplir plus, ensemble.
            </p>

            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">✅</div>
                    <div class="feature-content">
                        <h3>Gestion de tâches intelligente</h3>
                        <p>Organisez, priorisez et suivez vos tâches avec notre système intuitif</p>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <div class="feature-content">
                        <h3>Rapports AI</h3>
                        <p>Obtenez des insights personnalisés grâce à notre intelligence artificielle</p>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎥</div>
                    <div class="feature-content">
                        <h3>Visioconférences intégrées</h3>
                        <p>Collaborez en temps réel avec votre équipe via Giri Vision</p>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📧</div>
                    <div class="feature-content">
                        <h3>Emails professionnels</h3>
                        <p>Gérez vos communications directement depuis l''app</p>
                    </div>
                </div>
            </div>

            <div class="quick-start">
                <h3>🚀 Pour bien démarrer :</h3>
                <ol class="quick-start-list">
                    <li>Complétez votre profil dans les Paramètres</li>
                    <li>Créez votre première tâche</li>
                    <li>Explorez le Dashboard pour voir vos statistiques</li>
                    <li>Invitez des collègues à rejoindre l''espace de travail</li>
                </ol>
            </div>

            <div style="text-align: center;">
                <a href="https://giri.app" class="button">Commencer maintenant →</a>
            </div>

            <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin-top: 32px; text-align: center;">
                Besoin d''aide ? Consultez notre <a href="https://giri.app/help" style="color: #6366f1; text-decoration: none;">centre d''aide</a> ou contactez l''équipe.
            </p>
        </div>

        <div class="footer">
            <p style="margin: 0 0 12px;">
                <strong>Vos identifiants de connexion :</strong><br>
                Email : fanderock3@gmail.com<br>
                Mot de passe : (défini lors de l''inscription)
            </p>
            <p style="margin: 0;">
                Envoyé par <a href="https://giri.app">ProductiveApp</a><br>
                © 2026 ProductiveApp - Tous droits réservés
            </p>
        </div>
    </div>
</body>
</html>
', true, '07d7c195-a228-43cf-96a4-5d47fdbc3796', 'sent', NULL, NULL, NULL, '2026-02-12 04:38:09.792864', '2026-02-12 04:38:09.792864'),
	('441eeb70-e6b1-4d2c-b82e-9d2b158f2631', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', '🎉 ProductiveApp Mail - PRODUCTION MODE', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #6366f1; text-align: center;">🎉 Système Mail en Production !</h1><div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 12px; margin: 20px 0;"><h2 style="margin: 0 0 15px 0;">✅ Domaine giri.app Vérifié</h2><p style="margin: 0; font-size: 16px;">Le système mail peut maintenant envoyer à <strong>n''importe quelle adresse email</strong> !</p></div><div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;"><h3 style="margin-top: 0; color: #0c4a6e;">📧 Fonctionnalités actives:</h3><ul style="line-height: 1.8;"><li>✅ 5 templates HTML professionnels</li><li>✅ Notification auto assignation tâche</li><li>✅ Envoi multi-destinataires</li><li>✅ Support pièces jointes</li><li>✅ Database tracking</li></ul></div><div style="text-align: center; margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;"><p style="margin: 0; font-size: 18px; color: #92400e;"><strong>🚀 Le système est prêt pour la production !</strong></p></div><p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px;">Envoyé depuis ProductiveApp via Resend API<br>Email: noreply@giri.app</p></div>', true, NULL, 'failed', 'The giri.app domain is not verified. Please, add and verify your domain on https://resend.com/domains', NULL, NULL, '2026-02-12 04:44:39.320096', '2026-02-12 04:44:39.320096'),
	('75b27006-da21-41f6-b847-d3987b166678', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', '✅ Test ProductiveApp Mail', '<h1>Test réussi!</h1><p>Le système mail ProductiveApp fonctionne correctement.</p>', true, NULL, 'failed', 'The giri.app domain is not verified. Please, add and verify your domain on https://resend.com/domains', NULL, NULL, '2026-02-12 04:44:52.513139', '2026-02-12 04:44:52.513139'),
	('2af3b23b-0587-4ab2-a845-ad9955a5040f', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', '🎉 ProductiveApp Mail - MODE PRODUCTION', '<div style=''font-family:Arial;max-width:600px;margin:0 auto;padding:20px''><div style=''background:linear-gradient(135deg,#10b981,#059669);color:white;padding:40px;border-radius:12px;text-align:center''><h1 style=''margin:0;font-size:32px''>🎉 Système Mail Opérationnel !</h1><p style=''margin:15px 0 0 0;font-size:18px''>Domaine giri-app.com vérifié ✅</p></div><div style=''background:#f0f9ff;padding:30px;border-radius:8px;margin:20px 0''><h2 style=''color:#0c4a6e;margin-top:0''>📧 Le système peut maintenant envoyer partout !</h2><ul style=''line-height:2''><li>✅ 5 templates HTML professionnels</li><li>✅ Notification auto assignation tâche</li><li>✅ Envoi multi-destinataires</li><li>✅ Support pièces jointes</li><li>✅ Database tracking</li></ul></div><div style=''text-align:center;padding:30px;background:#fef3c7;border-radius:8px''><p style=''margin:0;font-size:20px;color:#92400e''><strong>🚀 PRÊT POUR LA PRODUCTION !</strong></p></div><p style=''color:#6b7280;font-size:12px;text-align:center;margin-top:20px''>Email envoyé depuis noreply@giri-app.com</p></div>', true, NULL, 'failed', 'The giri.app domain is not verified. Please, add and verify your domain on https://resend.com/domains', NULL, NULL, '2026-02-12 04:46:22.571654', '2026-02-12 04:46:22.571654'),
	('1996fef4-9731-42e9-a483-1c09c89500bc', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', '🎉 ProductiveApp Mail - MODE PRODUCTION', '<div style=''font-family:Arial;max-width:600px;margin:0 auto;padding:20px''><div style=''background:linear-gradient(135deg,#10b981,#059669);color:white;padding:40px;border-radius:12px;text-align:center''><h1 style=''margin:0;font-size:32px''>🎉 Système Mail Opérationnel !</h1><p style=''margin:15px 0 0 0;font-size:18px''>Domaine giri-app.com vérifié ✅</p></div><div style=''background:#f0f9ff;padding:30px;border-radius:8px;margin:20px 0''><h2 style=''color:#0c4a6e;margin-top:0''>📧 Le système peut maintenant envoyer partout !</h2><ul style=''line-height:2''><li>✅ 5 templates HTML professionnels</li><li>✅ Notification auto assignation tâche</li><li>✅ Envoi multi-destinataires</li><li>✅ Support pièces jointes</li><li>✅ Database tracking</li></ul></div><div style=''text-align:center;padding:30px;background:#fef3c7;border-radius:8px''><p style=''margin:0;font-size:20px;color:#92400e''><strong>🚀 PRÊT POUR LA PRODUCTION !</strong></p></div><p style=''color:#6b7280;font-size:12px;text-align:center;margin-top:20px''>Email envoyé depuis noreply@giri-app.com</p></div>', true, NULL, 'failed', 'The giri.app domain is not verified. Please, add and verify your domain on https://resend.com/domains', NULL, NULL, '2026-02-12 04:46:48.186788', '2026-02-12 04:46:48.186788'),
	('615a43a4-6a6e-4314-97ae-36957efa358a', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', '🎉 ProductiveApp Mail - MODE PRODUCTION', '<div style=''font-family:Arial;max-width:600px;margin:0 auto;padding:20px''><div style=''background:linear-gradient(135deg,#10b981,#059669);color:white;padding:40px;border-radius:12px;text-align:center''><h1 style=''margin:0;font-size:32px''>🎉 Système Mail Opérationnel !</h1><p style=''margin:15px 0 0 0;font-size:18px''>Domaine giri-app.com vérifié ✅</p></div><div style=''background:#f0f9ff;padding:30px;border-radius:8px;margin:20px 0''><h2 style=''color:#0c4a6e;margin-top:0''>📧 Le système peut maintenant envoyer partout !</h2><ul style=''line-height:2''><li>✅ 5 templates HTML professionnels</li><li>✅ Notification auto assignation tâche</li><li>✅ Envoi multi-destinataires</li><li>✅ Support pièces jointes</li><li>✅ Database tracking</li></ul></div><div style=''text-align:center;padding:30px;background:#fef3c7;border-radius:8px''><p style=''margin:0;font-size:20px;color:#92400e''><strong>🚀 PRÊT POUR LA PRODUCTION !</strong></p></div><p style=''color:#6b7280;font-size:12px;text-align:center;margin-top:20px''>Email envoyé depuis noreply@giri-app.com</p></div>', true, NULL, 'failed', 'The giri.app domain is not verified. Please, add and verify your domain on https://resend.com/domains', NULL, NULL, '2026-02-12 04:48:43.580358', '2026-02-12 04:48:43.580358'),
	('6d5ae203-3698-4761-a543-256bd5e22dc6', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', '🎉 ProductiveApp Mail - MODE PRODUCTION', '<div style=''font-family:Arial;max-width:600px;margin:0 auto;padding:20px''><div style=''background:linear-gradient(135deg,#10b981,#059669);color:white;padding:40px;border-radius:12px;text-align:center''><h1 style=''margin:0;font-size:32px''>🎉 Système Mail Opérationnel !</h1><p style=''margin:15px 0 0 0;font-size:18px''>Domaine giri-app.com vérifié ✅</p></div><div style=''background:#f0f9ff;padding:30px;border-radius:8px;margin:20px 0''><h2 style=''color:#0c4a6e;margin-top:0''>📧 Le système peut maintenant envoyer partout !</h2><ul style=''line-height:2''><li>✅ 5 templates HTML professionnels</li><li>✅ Notification auto assignation tâche</li><li>✅ Envoi multi-destinataires</li><li>✅ Support pièces jointes</li><li>✅ Database tracking</li></ul></div><div style=''text-align:center;padding:30px;background:#fef3c7;border-radius:8px''><p style=''margin:0;font-size:20px;color:#92400e''><strong>🚀 PRÊT POUR LA PRODUCTION !</strong></p></div><p style=''color:#6b7280;font-size:12px;text-align:center;margin-top:20px''>Email envoyé depuis noreply@giri-app.com</p></div>', true, NULL, 'failed', 'The giri.app domain is not verified. Please, add and verify your domain on https://resend.com/domains', NULL, NULL, '2026-02-12 04:48:57.312701', '2026-02-12 04:48:57.312701'),
	('101866d6-d305-43f7-9eae-9f40622dbdf6', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', 'Test Mail Production', '<h1>Test giri-app.com</h1>', true, 'ca267c57-b6fb-4c56-9391-6832fd51fcb1', 'sent', NULL, NULL, NULL, '2026-02-12 05:01:44.148267', '2026-02-12 05:01:44.148267'),
	('a971995b-e283-4200-902d-16b59591e153', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', 'test', 'faisons un test', true, 'ef7cc49d-9b3c-4faf-8242-83c063d2b2c0', 'sent', NULL, NULL, NULL, '2026-02-12 05:06:36.227191', '2026-02-12 05:06:36.227191'),
	('c1a65769-c524-4162-974f-497c46dd4b07', 'dd8db965-df93-4274-9ae9-8847a58730d3', NULL, '{contact@mahagiri.fr}', '{}', '{}', 'test', 'courage mon frère', true, 'fb0db0ec-1413-4acd-b724-3a55aeae0760', 'sent', NULL, NULL, NULL, '2026-02-12 05:27:12.775136', '2026-02-12 05:27:12.775136'),
	('181c924d-52c8-4696-8ce0-88d0fc8cf221', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: VERIFIER DOCUMENTS STRIPE (VOIR MAIL)', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Perso Maha</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">VERIFIER DOCUMENTS STRIPE (VOIR MAIL)</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">HIGH</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=406d8c03-ec54-444d-b677-ccf305baf8f1" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '65ef3d19-ce80-4d67-85a5-41c84616e53f', 'sent', NULL, NULL, NULL, '2026-02-12 09:04:22.704784', '2026-02-12 09:04:22.704784'),
	('fc024ae1-4a83-466f-859b-97b0324d8790', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: Des nouvelles de HAMID (Sahara) sur TEL PRO', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Perso Maha</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">Des nouvelles de HAMID (Sahara) sur TEL PRO</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-medium">MEDIUM</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=dc24572b-d388-4a41-9647-4d5c25ab2b47" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '6d1d889b-fc28-49de-b51c-ab3ee475edd5', 'sent', NULL, NULL, NULL, '2026-02-12 09:14:09.421154', '2026-02-12 09:14:09.421154'),
	('d8e3db56-1676-4097-8b4a-1648a0d1c18b', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: appeler Maif et régler ce que je leur dois', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Général</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">appeler Maif et régler ce que je leur dois</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=7c955103-e1fb-40c4-bf68-8d02dbf4bb1d" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, 'e5490929-0416-4ead-a8c1-1528dc48f573', 'sent', NULL, NULL, NULL, '2026-02-13 09:34:38.426893', '2026-02-13 09:34:38.426893'),
	('c63c9a93-170d-4528-b96b-420ce92ad511', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: Gérer Stripe pour ne pas risquer de perdre tous mes paiements', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Entreprise Interne</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">Gérer Stripe pour ne pas risquer de perdre tous mes paiements</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=017b4b04-4959-4a0c-ad40-1166008a856c" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, 'bcca500c-1f6b-41aa-b81f-767b9fffdb15', 'sent', NULL, NULL, NULL, '2026-02-13 09:35:18.960061', '2026-02-13 09:35:18.960061'),
	('aff1e483-e8cf-485a-a4de-5fc42bc81ecb', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: test', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Sans projet</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">test</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-medium">MEDIUM</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=1e4f9e64-b2dc-45d6-9cf9-94f7f8f80b6a" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, 'aad0e54f-768e-4c53-be0e-5881a2984920', 'sent', NULL, NULL, NULL, '2026-02-13 09:56:22.841675', '2026-02-13 09:56:22.841675'),
	('3f993e53-b693-41fa-a9fe-5e1d9fb3ef9e', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: Acheter Version Supérieure System.IO', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Académie</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">Acheter Version Supérieure System.IO</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">HIGH</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=79f892f8-b8ef-4dd6-a6a8-8c9aee4ae497" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '56aec19a-90d4-4153-8817-c7d813f56262', 'sent', NULL, NULL, NULL, '2026-02-14 18:20:32.623256', '2026-02-14 18:20:32.623256'),
	('9bf7182e-d0b1-45d8-a2e8-419bd73554e9', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: Dresser une liste de mes 10 tâches les plus importantes et urgentes', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Sans projet</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">Dresser une liste de mes 10 tâches les plus importantes et urgentes</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">HIGH</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=e2f2beed-8811-4211-aec6-53c4026fa6cc" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '04feb5f6-acba-4a64-9423-8eabbc923fe4', 'sent', NULL, NULL, NULL, '2026-02-15 02:16:05.97655', '2026-02-15 02:16:05.97655'),
	('b0ad99f8-c8d9-43a0-8a9a-5ed8ff76a47e', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: être ou ne pas être tel est la question', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Sans projet</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">être ou ne pas être tel est la question</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">HIGH</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=797d8a72-60e5-48e5-a8fd-fef12274b3ee" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, 'd7ecfbe6-3ef0-4639-ab0b-1844808f690f', 'sent', NULL, NULL, NULL, '2026-02-15 02:28:01.355577', '2026-02-15 02:28:01.355577'),
	('5bcc0f48-6edc-4434-9170-7ed371f0e37f', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: Enregistrer le nouveau num de Marie dans tel pro', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Général</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">Enregistrer le nouveau num de Marie dans tel pro</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=c824e3ec-4d12-4c68-9500-5780db2b7297" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, 'abc41cf0-ced9-4d82-bcab-68872010312f', 'sent', NULL, NULL, NULL, '2026-02-15 09:31:01.557118', '2026-02-15 09:31:01.557118'),
	('287b01a7-e392-43e3-8031-6a9fb894244f', '7ea300fa-b086-4215-8641-bdb4dfb0c543', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{brice@giri-app.com}', '{}', '{}', '✅ Nouvelle tâche: 2e modification palmira', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Brice</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Digital Giri</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">2e modification palmira</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=2c54cc1c-592e-4822-a4d6-863ec53df36d" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '837bc28a-9b5e-4ae2-8e53-7adf64881440', 'sent', NULL, NULL, NULL, '2026-02-14 14:32:21.536363', '2026-02-14 14:32:21.536363'),
	('51704c3d-8379-4977-bd6b-d0c5576a2653', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: déclaration ursaff', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Entreprise Interne</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">déclaration ursaff</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=0a5b37af-64b9-41ba-bfe0-82ffe26eac55" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, 'c870a634-4ed7-4485-8aee-79ce50f7293c', 'sent', NULL, NULL, NULL, '2026-02-14 19:58:14.642728', '2026-02-14 19:58:14.642728'),
	('58a821ea-146f-4188-aea1-aaeed1199f1f', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: Appeler Brice demain à 15h', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Sans projet</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">Appeler Brice demain à 15h</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">HIGH</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=152956ab-9db7-42dc-b736-ab262803d2dd" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, 'f9ab5506-a77e-43d0-a5cb-5ea12686d64e', 'sent', NULL, NULL, NULL, '2026-02-14 20:03:04.957508', '2026-02-14 20:03:04.957508'),
	('c49831d5-cdad-469b-864f-c215923de541', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: texte', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Sans projet</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">texte</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">HIGH</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=c43cab65-315a-4c3b-aab3-a1d8ca872c4c" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '507d845f-92d3-4887-aaac-e8ed419e6f3d', 'sent', NULL, NULL, NULL, '2026-02-15 02:23:58.226766', '2026-02-15 02:23:58.226766'),
	('8bee9f42-cd5f-4eeb-91b0-5a04ba6f6741', '7ea300fa-b086-4215-8641-bdb4dfb0c543', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{brice@giri-app.com}', '{}', '{}', '✅ Nouvelle tâche: test tasks', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Brice</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Académie</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">test tasks</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">HIGH</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=47f505d5-726e-4c5d-a602-4d3c4d0a574f" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '077a596e-2916-49e5-be7d-686c89846353', 'sent', NULL, NULL, NULL, '2026-02-15 17:41:32.166621', '2026-02-15 17:41:32.166621'),
	('805eaa8c-98e2-45ec-9f61-3caba05fe27a', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: Document officiel PLR pour Angelique (Capsule)', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Général</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">Document officiel PLR pour Angelique (Capsule)</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">HIGH</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=2ae06027-d0ea-40f6-a4e1-e75cdcd804c1" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '456d4a6d-1cec-4809-b5a1-9269a824f14b', 'sent', NULL, NULL, NULL, '2026-02-16 09:12:56.492865', '2026-02-16 09:12:56.492865'),
	('623407bb-3343-42bd-ad33-58cc11045786', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: fixer un rendez vous avec léo', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Général</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">fixer un rendez vous avec léo</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=073c5a27-eef7-4349-a180-2c70238b77c6" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, 'cfb4e2ea-4cab-4065-81e2-1390787d965e', 'sent', NULL, NULL, NULL, '2026-02-16 13:59:06.334513', '2026-02-16 13:59:06.334513'),
	('7abc538a-301b-4c9c-ba58-f5e74306e36f', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: Finir la formation chat gpt', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Général</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">Finir la formation chat gpt</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=a4eb2eaf-e702-405d-8e27-aba2b6051f9c" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '98c07114-e668-4030-a1db-333ce4ba83c9', 'sent', NULL, NULL, NULL, '2026-02-16 13:59:19.040771', '2026-02-16 13:59:19.040771'),
	('6529668a-4850-4e3d-8e57-11faac6fa05e', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: finir la formation cash flow avec mike lilian et Raya', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Général</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">finir la formation cash flow avec mike lilian et Raya</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=d7e8dc5a-c626-4f96-8318-e976fd185a58" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '9715b80d-c0d1-4602-b96a-08c11a116d85', 'sent', NULL, NULL, NULL, '2026-02-16 13:59:35.473941', '2026-02-16 13:59:35.473941'),
	('9c8c7675-16cf-4f07-8a59-b02f051bd7b3', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: gérer sstripe une nouvelle fois.', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Général</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">gérer sstripe une nouvelle fois.</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=e4b6a083-ee2d-4568-bf60-654dfc6bc336" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '7420d673-15d7-43ad-9e04-be2f36c84ee9', 'sent', NULL, NULL, NULL, '2026-02-16 14:01:13.31002', '2026-02-16 14:01:13.31002'),
	('e3c27114-f47a-402c-9b79-ebe1c90cb4e5', '7ea300fa-b086-4215-8641-bdb4dfb0c543', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{brice@giri-app.com}', '{}', '{}', '✅ Nouvelle tâche: Test task', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Brice</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Digital Giri</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">Test task</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">HIGH</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=bc3ff2cf-f09e-44b4-a86b-e3ea3e31af09" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, 'a9871a9d-888e-4c5e-adb3-0825f2d5c344', 'sent', NULL, NULL, NULL, '2026-02-16 15:16:59.248212', '2026-02-16 15:16:59.248212'),
	('0256b4b7-9ebc-4b48-b562-42fadb2fb971', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: test task', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Académie</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">test task</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">HIGH</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=5f919a32-f1d4-47c3-8cf1-2b419597d4c3" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '773c3c35-a6c9-4edf-a1f6-0ce3740cf2ba', 'sent', NULL, NULL, NULL, '2026-02-16 15:17:20.548036', '2026-02-16 15:17:20.548036'),
	('b4e53ae1-a70d-4e6e-a8fe-f41db56ca501', '7ea300fa-b086-4215-8641-bdb4dfb0c543', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{brice@giri-app.com}', '{}', '{}', '✅ Nouvelle tâche: test task 2', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Brice</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Académie</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">test task 2</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-medium">MEDIUM</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=448a8f85-1c28-4b23-b535-9e1e71cf58ee" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '7f0e9c43-1483-46ee-b654-9e029f906996', 'sent', NULL, NULL, NULL, '2026-02-16 15:18:11.610387', '2026-02-16 15:18:11.610387'),
	('a9f741e0-db71-4e5a-ae70-569f4e01b927', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: créer la page de défense alerte faux guru', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Général</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">créer la page de défense alerte faux guru</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=690d7f3d-b132-4082-bf92-05df19440460" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '4bb7ebbe-e28d-47a7-8b09-46856ebb48b2', 'sent', NULL, NULL, NULL, '2026-02-16 15:54:09.871389', '2026-02-16 15:54:09.871389'),
	('73f8faa9-ca3d-4717-8baf-ab8cc3a034df', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: crée la section sur le link tree affaire juridique en cours', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Général</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">crée la section sur le link tree affaire juridique en cours</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=074896be-f8f4-4e83-b75b-94ebd4a3d144" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '60a94834-835b-43da-9530-8203adc42614', 'sent', NULL, NULL, NULL, '2026-02-16 16:24:39.216823', '2026-02-16 16:24:39.216823'),
	('4d2a7ac5-3a43-49d0-b841-8857c5fdae04', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: caler plan de paiement avec Rayahine', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Sans projet</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">caler plan de paiement avec Rayahine</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-medium">MEDIUM</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=2ff91524-757b-41aa-b410-393e06b8b543" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '43c7345e-2342-4df2-bef7-e02f6b9b3aad', 'sent', NULL, NULL, NULL, '2026-02-16 16:24:55.956581', '2026-02-16 16:24:55.956581'),
	('38426113-b8ef-4e53-bf1f-a2565385a1f0', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: faire en sorte que toutes les urls de formation lien de vente tunnelle de vente soit harmonisé sur system io ;) afin de vendre plus et faire de l''affiliation en automatique.', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Général</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">faire en sorte que toutes les urls de formation lien de vente tunnelle de vente soit harmonisé sur system io ;) afin de vendre plus et faire de l''affiliation en automatique.</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-high">URGENT</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=e1b29032-3732-4b2c-b8db-3273c4effd71" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, 'e7ad6060-f921-4cce-9f7c-714905250842', 'sent', NULL, NULL, NULL, '2026-02-16 16:51:08.902106', '2026-02-16 16:51:08.902106'),
	('61ff461d-ee2f-42b9-b883-f9bbeb472c99', 'dd8db965-df93-4274-9ae9-8847a58730d3', 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f', '{contact@mahagiri.fr}', '{}', '{}', '✅ Nouvelle tâche: créer plan de paiement rayahine et encaisser les sous', '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle tâche assignée</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 32px; }
        .task-card { background: #fafafa; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .task-title { font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 12px; }
        .task-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
        .meta-item { display: flex; align-items: center; gap: 8px; color: #71717a; font-size: 14px; }
        .meta-icon { width: 16px; height: 16px; }
        .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 24px; }
        .footer { padding: 32px; text-align: center; background: #fafafa; color: #71717a; font-size: 14px; border-top: 1px solid #e4e4e7; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Nouvelle tâche assignée</h1>
            <p>Une tâche vous a été assignée dans ProductiveApp</p>
        </div>

        <div class="content">
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>Team Maha Giri</strong>,
            </p>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez été assigné(e) à une nouvelle tâche dans le projet <strong>Sans projet</strong>.
            </p>

            <div class="task-card">
                <h2 class="task-title">créer plan de paiement rayahine et encaisser les sous</h2>
                <p style="color: #52525b; margin: 0; line-height: 1.6;">Aucune description</p>

                <div class="task-meta">
                    <div class="meta-item">
                        <span>📅 Échéance :</span>
                        <strong>Aucune</strong>
                    </div>
                    <div class="meta-item">
                        <span>👤 Assigné par :</span>
                        <strong>Team Maha Giri</strong>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <span class="priority-badge priority-medium">MEDIUM</span>
                </div>
            </div>

            <a href="https://giri-app.com/tasks?id=3a321eac-3fbc-4f53-a89a-ced976d2e257" class="button">Voir la tâche →</a>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                Cet email a été envoyé par <a href="https://giri-app.com">ProductiveApp</a><br>
                Vous recevez cet email car vous êtes membre de l''équipe.
            </p>
        </div>
    </div>
</body>
</html>
', true, '17b96bbe-6270-444a-97db-03a585ca5a80', 'sent', NULL, NULL, NULL, '2026-02-16 17:02:07.236662', '2026-02-16 17:02:07.236662');


--
-- PostgreSQL database dump complete
--

\unrestrict ZUUwebglc5p7NcKZxjtlr9ZBRkigT930Lv2xVK2tIFmfoKuWVxzBMs3aeR94Si0

