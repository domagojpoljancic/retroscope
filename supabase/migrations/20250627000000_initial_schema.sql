-- RetroScope initial schema
-- Apply via Supabase CLI or SQL editor

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE workspace_member_role AS ENUM ('owner', 'facilitator', 'participant');

CREATE TYPE session_phase AS ENUM (
  'lobby',
  'warmup',
  'previous_action_review',
  'writing_setup',
  'writing',
  'reveal_group',
  'voting_setup',
  'voting',
  'discussion',
  'summary'
);

CREATE TYPE session_status AS ENUM ('draft', 'active', 'completed', 'archived');

CREATE TYPE warmup_type AS ENUM ('mood_character', 'this_or_that', 'guessing_game');

CREATE TYPE framework_type AS ENUM ('start_stop_continue', 'mad_sad_glad', 'sailboat');

CREATE TYPE grouping_permission AS ENUM ('facilitator_only', 'participants_allowed');

CREATE TYPE timer_phase AS ENUM ('writing', 'voting');

CREATE TYPE timer_status AS ENUM ('not_started', 'running', 'paused', 'ended');

CREATE TYPE vote_target_type AS ENUM ('card', 'group');

CREATE TYPE action_item_priority AS ENUM ('low', 'medium', 'high');

CREATE TYPE action_item_status AS ENUM ('to_do', 'in_progress', 'done');

CREATE TYPE grouping_event_type AS ENUM (
  'group_created',
  'group_deleted',
  'group_title_updated',
  'cards_grouped',
  'cards_ungrouped',
  'group_merged'
);

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Workspaces
-- ---------------------------------------------------------------------------

CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My workspace',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role workspace_member_role NOT NULL DEFAULT 'participant',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- ---------------------------------------------------------------------------
-- Sessions
-- ---------------------------------------------------------------------------

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  session_code TEXT NOT NULL,
  warmup_type warmup_type NOT NULL,
  framework_type framework_type NOT NULL,
  anonymous_cards BOOLEAN NOT NULL DEFAULT false,
  facilitator_participates BOOLEAN NOT NULL DEFAULT true,
  grouping_permission grouping_permission NOT NULL DEFAULT 'facilitator_only',
  current_phase session_phase NOT NULL DEFAULT 'lobby',
  status session_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  UNIQUE (session_code)
);

CREATE INDEX idx_sessions_workspace ON sessions(workspace_id);
CREATE INDEX idx_sessions_code ON sessions(session_code);

-- ---------------------------------------------------------------------------
-- Session participants
-- ---------------------------------------------------------------------------

CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  participant_token_hash TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  is_facilitator_participant BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE UNIQUE INDEX idx_session_participants_token_hash ON session_participants(participant_token_hash);

-- ---------------------------------------------------------------------------
-- Warmup responses
-- ---------------------------------------------------------------------------

CREATE TABLE warmup_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES session_participants(id) ON DELETE CASCADE,
  warmup_type warmup_type NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, participant_id)
);

-- ---------------------------------------------------------------------------
-- Retro cards
-- ---------------------------------------------------------------------------

CREATE TABLE retro_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES session_participants(id),
  framework_column TEXT NOT NULL,
  text TEXT NOT NULL,
  is_revealed BOOLEAN NOT NULL DEFAULT false,
  revealed_at TIMESTAMPTZ,
  group_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_retro_cards_session ON retro_cards(session_id);

-- ---------------------------------------------------------------------------
-- Card groups
-- ---------------------------------------------------------------------------

CREATE TABLE card_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_by_participant_id UUID REFERENCES session_participants(id),
  created_by_user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_card_groups_session ON card_groups(session_id);

ALTER TABLE retro_cards
  ADD CONSTRAINT retro_cards_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES card_groups(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Grouping events
-- ---------------------------------------------------------------------------

CREATE TABLE grouping_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  actor_participant_id UUID REFERENCES session_participants(id),
  actor_user_id UUID REFERENCES profiles(id),
  event_type grouping_event_type NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  undone_at TIMESTAMPTZ
);

CREATE INDEX idx_grouping_events_session ON grouping_events(session_id);

-- ---------------------------------------------------------------------------
-- Session timers
-- ---------------------------------------------------------------------------

CREATE TABLE session_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  phase timer_phase NOT NULL,
  duration_seconds INTEGER NOT NULL,
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  status timer_status NOT NULL DEFAULT 'not_started',
  UNIQUE (session_id, phase)
);

-- ---------------------------------------------------------------------------
-- Voting
-- ---------------------------------------------------------------------------

CREATE TABLE voting_settings (
  session_id UUID PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  votes_per_participant INTEGER NOT NULL DEFAULT 3,
  allow_multiple_votes_per_target BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES session_participants(id) ON DELETE CASCADE,
  target_type vote_target_type NOT NULL,
  target_card_id UUID REFERENCES retro_cards(id) ON DELETE CASCADE,
  target_group_id UUID REFERENCES card_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_votes_session ON votes(session_id);

-- ---------------------------------------------------------------------------
-- Actions
-- ---------------------------------------------------------------------------

CREATE TABLE action_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES session_participants(id),
  text TEXT NOT NULL,
  source_card_id UUID REFERENCES retro_cards(id),
  source_group_id UUID REFERENCES card_groups(id),
  converted_action_item_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_session_id UUID NOT NULL REFERENCES sessions(id),
  source_card_id UUID REFERENCES retro_cards(id),
  source_group_id UUID REFERENCES card_groups(id),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to_name TEXT NOT NULL,
  assigned_to_user_id UUID REFERENCES profiles(id),
  due_date DATE,
  priority action_item_priority NOT NULL DEFAULT 'medium',
  status action_item_status NOT NULL DEFAULT 'to_do',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_action_items_workspace ON action_items(workspace_id);

ALTER TABLE action_suggestions
  ADD CONSTRAINT action_suggestions_converted_fkey
  FOREIGN KEY (converted_action_item_id) REFERENCES action_items(id);

CREATE TABLE action_board_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  share_token_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  regenerated_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_action_board_shares_token_hash ON action_board_shares(share_token_hash);
CREATE INDEX idx_action_board_shares_workspace ON action_board_shares(workspace_id);

-- ---------------------------------------------------------------------------
-- Auth bootstrap: profile + default workspace on signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  INSERT INTO public.workspaces (name)
  VALUES ('My workspace')
  RETURNING id INTO new_workspace_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE warmup_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE retro_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE grouping_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_board_shares ENABLE ROW LEVEL SECURITY;

-- Helper: user is member of workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$;

-- Helper: user owns or facilitates workspace session
CREATE OR REPLACE FUNCTION public.can_manage_session(sess_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM sessions s
    JOIN workspace_members wm ON wm.workspace_id = s.workspace_id
    WHERE s.id = sess_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'facilitator')
  );
$$;

-- Profiles
CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);

-- Workspaces
CREATE POLICY workspaces_select ON workspaces FOR SELECT
  USING (public.is_workspace_member(id));
CREATE POLICY workspaces_update ON workspaces FOR UPDATE
  USING (public.is_workspace_member(id));

-- Workspace members
CREATE POLICY workspace_members_select ON workspace_members FOR SELECT
  USING (public.is_workspace_member(workspace_id));

-- Sessions — facilitators read/write via workspace membership
CREATE POLICY sessions_select ON sessions FOR SELECT
  USING (public.is_workspace_member(workspace_id));
CREATE POLICY sessions_insert ON sessions FOR INSERT
  WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY sessions_update ON sessions FOR UPDATE
  USING (public.can_manage_session(id));

-- Session participants — facilitators can read; writes via service role
CREATE POLICY session_participants_select ON session_participants FOR SELECT
  USING (public.can_manage_session(session_id));

-- Warmup, cards, groups, events, timers, voting — facilitator read
CREATE POLICY warmup_responses_select ON warmup_responses FOR SELECT
  USING (public.can_manage_session(session_id));
CREATE POLICY retro_cards_select ON retro_cards FOR SELECT
  USING (public.can_manage_session(session_id));
CREATE POLICY card_groups_select ON card_groups FOR SELECT
  USING (public.can_manage_session(session_id));
CREATE POLICY grouping_events_select ON grouping_events FOR SELECT
  USING (public.can_manage_session(session_id));
CREATE POLICY session_timers_select ON session_timers FOR SELECT
  USING (public.can_manage_session(session_id));
CREATE POLICY voting_settings_select ON voting_settings FOR SELECT
  USING (public.can_manage_session(session_id));
CREATE POLICY votes_select ON votes FOR SELECT
  USING (public.can_manage_session(session_id));
CREATE POLICY action_suggestions_select ON action_suggestions FOR SELECT
  USING (public.can_manage_session(session_id));

-- Action items — workspace scoped
CREATE POLICY action_items_select ON action_items FOR SELECT
  USING (public.is_workspace_member(workspace_id));
CREATE POLICY action_items_insert ON action_items FOR INSERT
  WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY action_items_update ON action_items FOR UPDATE
  USING (public.is_workspace_member(workspace_id));

-- Action board shares — workspace members manage
CREATE POLICY action_board_shares_select ON action_board_shares FOR SELECT
  USING (public.is_workspace_member(workspace_id));
CREATE POLICY action_board_shares_insert ON action_board_shares FOR INSERT
  WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY action_board_shares_update ON action_board_shares FOR UPDATE
  USING (public.is_workspace_member(workspace_id));

-- NOTE: Participant-token writes and share-token reads are enforced in server
-- actions using the service role key. Tighten RLS with custom JWT claims later.

-- Enable Realtime for live session tables
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE warmup_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE retro_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE card_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE grouping_events;
ALTER PUBLICATION supabase_realtime ADD TABLE session_timers;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE action_suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE action_items;
