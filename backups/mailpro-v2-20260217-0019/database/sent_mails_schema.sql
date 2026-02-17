--
-- PostgreSQL database dump
--

\restrict 0MqcR2VMGJnPeceXhJLoNX4khw1qcjBRBOYL4czd69Q8L008QK28F5QTfqelAwy

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: sent_mails; Type: TABLE; Schema: public; Owner: productive_user
--

CREATE TABLE public.sent_mails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    workspace_id uuid,
    to_addresses text[] NOT NULL,
    cc_addresses text[],
    bcc_addresses text[],
    subject text NOT NULL,
    body text NOT NULL,
    is_html boolean DEFAULT true,
    resend_id text,
    status text DEFAULT 'sent'::text NOT NULL,
    error_message text,
    opened_at timestamp without time zone,
    clicked_at timestamp without time zone,
    sent_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sent_mails OWNER TO productive_user;

--
-- Name: TABLE sent_mails; Type: COMMENT; Schema: public; Owner: productive_user
--

COMMENT ON TABLE public.sent_mails IS 'Historique des emails envoyés via Resend';


--
-- Name: COLUMN sent_mails.resend_id; Type: COMMENT; Schema: public; Owner: productive_user
--

COMMENT ON COLUMN public.sent_mails.resend_id IS 'ID fourni par Resend pour tracking';


--
-- Name: COLUMN sent_mails.opened_at; Type: COMMENT; Schema: public; Owner: productive_user
--

COMMENT ON COLUMN public.sent_mails.opened_at IS 'Date d''ouverture (via webhook Resend)';


--
-- Name: COLUMN sent_mails.clicked_at; Type: COMMENT; Schema: public; Owner: productive_user
--

COMMENT ON COLUMN public.sent_mails.clicked_at IS 'Date du premier clic (via webhook Resend)';


--
-- Name: sent_mails sent_mails_pkey; Type: CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.sent_mails
    ADD CONSTRAINT sent_mails_pkey PRIMARY KEY (id);


--
-- Name: idx_sent_mails_resend_id; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_sent_mails_resend_id ON public.sent_mails USING btree (resend_id);


--
-- Name: idx_sent_mails_sent_at; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_sent_mails_sent_at ON public.sent_mails USING btree (sent_at DESC);


--
-- Name: idx_sent_mails_user_id; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_sent_mails_user_id ON public.sent_mails USING btree (user_id);


--
-- Name: idx_sent_mails_workspace_id; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_sent_mails_workspace_id ON public.sent_mails USING btree (workspace_id);


--
-- Name: sent_mails sent_mails_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.sent_mails
    ADD CONSTRAINT sent_mails_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sent_mails sent_mails_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.sent_mails
    ADD CONSTRAINT sent_mails_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 0MqcR2VMGJnPeceXhJLoNX4khw1qcjBRBOYL4czd69Q8L008QK28F5QTfqelAwy

