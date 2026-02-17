--
-- PostgreSQL database dump
--

\restrict w4ofjoOctamTcSyF2km8HwnzWZfbJgP772qrREKv0i3fD4RqIj3LcfbLeqg6CUN

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
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: productive_user
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    date date NOT NULL,
    content text,
    mood integer,
    energy_level integer,
    sleep_quality integer,
    tags jsonb DEFAULT '[]'::jsonb,
    weather jsonb,
    highlights jsonb DEFAULT '[]'::jsonb,
    challenges jsonb DEFAULT '[]'::jsonb,
    gratitude jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT journal_entries_energy_level_check CHECK (((energy_level >= 1) AND (energy_level <= 10))),
    CONSTRAINT journal_entries_mood_check CHECK (((mood >= 1) AND (mood <= 10))),
    CONSTRAINT journal_entries_sleep_quality_check CHECK (((sleep_quality >= 1) AND (sleep_quality <= 10)))
);


ALTER TABLE public.journal_entries OWNER TO productive_user;

--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: productive_user
--



--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_user_id_workspace_id_date_key; Type: CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_user_id_workspace_id_date_key UNIQUE (user_id, workspace_id, date);


--
-- Name: idx_journal_entries_date; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_journal_entries_date ON public.journal_entries USING btree (date DESC);


--
-- Name: idx_journal_entries_tags; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_journal_entries_tags ON public.journal_entries USING gin (tags);


--
-- Name: idx_journal_entries_user_id; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_journal_entries_user_id ON public.journal_entries USING btree (user_id);


--
-- Name: idx_journal_entries_workspace_id; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_journal_entries_workspace_id ON public.journal_entries USING btree (workspace_id);


--
-- Name: journal_entries update_journal_entries_updated_at; Type: TRIGGER; Schema: public; Owner: productive_user
--

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: journal_entries journal_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: journal_entries journal_entries_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict w4ofjoOctamTcSyF2km8HwnzWZfbJgP772qrREKv0i3fD4RqIj3LcfbLeqg6CUN

