--
-- PostgreSQL database dump
--

\restrict t2se4QPaObdG2cgho0qHKg1it9FP3ZC8NsqHdxw7fle264by5x2ZUv0GkMB1Nq9

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
-- Name: daily_task_summary; Type: TABLE; Schema: public; Owner: productive_user
--

CREATE TABLE public.daily_task_summary (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    workspace_id uuid NOT NULL,
    user_id uuid,
    summary_date date NOT NULL,
    tasks_created integer DEFAULT 0,
    tasks_completed integer DEFAULT 0,
    tasks_updated integer DEFAULT 0,
    tasks_deleted integer DEFAULT 0,
    total_actions integer DEFAULT 0,
    task_ids uuid[],
    activity_data jsonb,
    ai_summary text,
    ai_achievements text[],
    ai_patterns text[],
    ai_recommendations text[],
    ai_productivity_score integer,
    ai_generated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.daily_task_summary OWNER TO productive_user;

--
-- Name: TABLE daily_task_summary; Type: COMMENT; Schema: public; Owner: productive_user
--

COMMENT ON TABLE public.daily_task_summary IS 'Auto-generated daily summaries with AI-powered insights and recommendations';


--
-- Data for Name: daily_task_summary; Type: TABLE DATA; Schema: public; Owner: productive_user
--



--
-- Name: daily_task_summary daily_task_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.daily_task_summary
    ADD CONSTRAINT daily_task_summary_pkey PRIMARY KEY (id);


--
-- Name: daily_task_summary daily_task_summary_workspace_id_user_id_summary_date_key; Type: CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.daily_task_summary
    ADD CONSTRAINT daily_task_summary_workspace_id_user_id_summary_date_key UNIQUE (workspace_id, user_id, summary_date);


--
-- Name: idx_daily_summary_date; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_daily_summary_date ON public.daily_task_summary USING btree (summary_date);


--
-- Name: idx_daily_summary_score; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_daily_summary_score ON public.daily_task_summary USING btree (ai_productivity_score);


--
-- Name: idx_daily_summary_user; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_daily_summary_user ON public.daily_task_summary USING btree (user_id);


--
-- Name: idx_daily_summary_workspace; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_daily_summary_workspace ON public.daily_task_summary USING btree (workspace_id);


--
-- Name: daily_task_summary daily_task_summary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.daily_task_summary
    ADD CONSTRAINT daily_task_summary_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: daily_task_summary daily_task_summary_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.daily_task_summary
    ADD CONSTRAINT daily_task_summary_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict t2se4QPaObdG2cgho0qHKg1it9FP3ZC8NsqHdxw7fle264by5x2ZUv0GkMB1Nq9

