--
-- PostgreSQL database dump
--

\restrict gJwHo8xPgqvduL5MO4nPlfLSewhLDOAkXvN3SRpGcKlCKzcGUzhbWcA724VTDxx

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
-- Name: task_activity_log; Type: TABLE; Schema: public; Owner: productive_user
--

CREATE TABLE public.task_activity_log (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    workspace_id uuid NOT NULL,
    task_id uuid NOT NULL,
    user_id uuid NOT NULL,
    action_type character varying(50) NOT NULL,
    previous_state jsonb,
    new_state jsonb,
    changes jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.task_activity_log OWNER TO productive_user;

--
-- Name: TABLE task_activity_log; Type: COMMENT; Schema: public; Owner: productive_user
--

COMMENT ON TABLE public.task_activity_log IS 'Logs every action performed on tasks for daily journaling and AI analysis';


--
-- Data for Name: task_activity_log; Type: TABLE DATA; Schema: public; Owner: productive_user
--



--
-- Name: task_activity_log task_activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.task_activity_log
    ADD CONSTRAINT task_activity_log_pkey PRIMARY KEY (id);


--
-- Name: idx_task_activity_action; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_task_activity_action ON public.task_activity_log USING btree (action_type);


--
-- Name: idx_task_activity_date; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_task_activity_date ON public.task_activity_log USING btree (created_at);


--
-- Name: idx_task_activity_task; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_task_activity_task ON public.task_activity_log USING btree (task_id);


--
-- Name: idx_task_activity_user; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_task_activity_user ON public.task_activity_log USING btree (user_id);


--
-- Name: idx_task_activity_workspace; Type: INDEX; Schema: public; Owner: productive_user
--

CREATE INDEX idx_task_activity_workspace ON public.task_activity_log USING btree (workspace_id);


--
-- Name: task_activity_log task_activity_log_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.task_activity_log
    ADD CONSTRAINT task_activity_log_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_activity_log task_activity_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.task_activity_log
    ADD CONSTRAINT task_activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task_activity_log task_activity_log_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: productive_user
--

ALTER TABLE ONLY public.task_activity_log
    ADD CONSTRAINT task_activity_log_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict gJwHo8xPgqvduL5MO4nPlfLSewhLDOAkXvN3SRpGcKlCKzcGUzhbWcA724VTDxx

