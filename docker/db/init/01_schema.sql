CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  CREATE TYPE "Connections_status_enum" AS ENUM (
    'pending',
    'accepted',
    'declined',
    'waiting-for-current-user-approval',
    'nothing-sent'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE study_sessions_status_enum AS ENUM (
    'pending',
    'confirmed',
    'canceled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  "profileImage" character varying,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  bio text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.skills (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT skills_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."Connections" (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status "Connections_status_enum" NOT NULL DEFAULT 'pending',
  "creatorId" uuid,
  "receiverId" uuid,
  CONSTRAINT "Connections_pkey" PRIMARY KEY (id),
  CONSTRAINT "FK_Connections_creator" FOREIGN KEY ("creatorId") REFERENCES public.users(id),
  CONSTRAINT "FK_Connections_receiver" FOREIGN KEY ("receiverId") REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  "friendRequestId" uuid UNIQUE,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT "FK_conversations_friend_request" FOREIGN KEY ("friendRequestId") REFERENCES public."Connections"(id)
);

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  "authorId" uuid NOT NULL,
  content text NOT NULL,
  media text,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT "FK_posts_author" FOREIGN KEY ("authorId") REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  content text NOT NULL,
  "postId" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT "FK_comments_post" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT "FK_comments_user" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "postId" uuid NOT NULL,
  "userId" uuid NOT NULL,
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT "UQ_post_user_like" UNIQUE ("postId", "userId"),
  CONSTRAINT "FK_post_likes_post" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT "FK_post_likes_user" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status study_sessions_status_enum NOT NULL DEFAULT 'pending',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  "subjectTeachId" uuid NOT NULL,
  "subjectLearnId" uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  creatorid uuid NOT NULL,
  participantid uuid NOT NULL,
  scheduledat timestamp without time zone NOT NULL,
  link character varying NOT NULL,
  CONSTRAINT study_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT "FK_study_sessions_subject_teach" FOREIGN KEY ("subjectTeachId") REFERENCES public.skills(id),
  CONSTRAINT "FK_study_sessions_subject_learn" FOREIGN KEY ("subjectLearnId") REFERENCES public.skills(id),
  CONSTRAINT "FK_study_sessions_creator" FOREIGN KEY (creatorid) REFERENCES public.users(id),
  CONSTRAINT "FK_study_sessions_participant" FOREIGN KEY (participantid) REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  filename character varying NOT NULL,
  path character varying NOT NULL,
  mimetype character varying NOT NULL,
  session_id uuid,
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT "FK_documents_session" FOREIGN KEY (session_id) REFERENCES public.study_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.user_skills_to_learn (
  "userId" uuid NOT NULL,
  "skillId" uuid NOT NULL,
  CONSTRAINT user_skills_to_learn_pkey PRIMARY KEY ("userId", "skillId"),
  CONSTRAINT "FK_user_skills_to_learn_user" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT "FK_user_skills_to_learn_skill" FOREIGN KEY ("skillId") REFERENCES public.skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.user_skills_to_teach (
  "userId" uuid NOT NULL,
  "skillId" uuid NOT NULL,
  CONSTRAINT user_skills_to_teach_pkey PRIMARY KEY ("userId", "skillId"),
  CONSTRAINT "FK_user_skills_to_teach_user" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT "FK_user_skills_to_teach_skill" FOREIGN KEY ("skillId") REFERENCES public.skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content text NOT NULL,
  "senderId" uuid,
  "conversationId" uuid,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT "FK_messages_sender" FOREIGN KEY ("senderId") REFERENCES public.users(id),
  CONSTRAINT "FK_messages_conversation" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON DELETE CASCADE
);
