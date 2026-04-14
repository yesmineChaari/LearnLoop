-- Demo users password: Password123!
-- bcrypt hash generated from backend-compatible cost factor.

INSERT INTO public.users (id, name, email, password, bio, "profileImage")
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Alice Mentor', 'alice@learnloop.dev', '$2b$10$RLa7EzuiZskK6zXmsbHNiemAi/ipsMHUjRU7g47FskH.H6Bnb9ueS', 'Full-stack engineer who teaches programming and mentoring.', 'https://i.pravatar.cc/150?img=32'),
  ('22222222-2222-4222-8222-222222222222', 'Bob Learner', 'bob@learnloop.dev', '$2b$10$RLa7EzuiZskK6zXmsbHNiemAi/ipsMHUjRU7g47FskH.H6Bnb9ueS', 'Junior developer learning backend architecture.', 'https://i.pravatar.cc/150?img=12'),
  ('33333333-3333-4333-8333-333333333333', 'Charlie Hybrid', 'charlie@learnloop.dev', '$2b$10$RLa7EzuiZskK6zXmsbHNiemAi/ipsMHUjRU7g47FskH.H6Bnb9ueS', 'Data enthusiast teaching math and learning software design.', 'https://i.pravatar.cc/150?img=15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.skills (id, name)
VALUES
  ('44444444-4444-4444-8444-444444444441', 'Mathematics'),
  ('44444444-4444-4444-8444-444444444442', 'Physics'),
  ('44444444-4444-4444-8444-444444444443', 'Computer Science'),
  ('44444444-4444-4444-8444-444444444444', 'English Writing'),
  ('44444444-4444-4444-8444-444444444445', 'Public Speaking')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_skills_to_teach ("userId", "skillId")
VALUES
  ('11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444443'),
  ('11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444445'),
  ('33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444441')
ON CONFLICT ("userId", "skillId") DO NOTHING;

INSERT INTO public.user_skills_to_learn ("userId", "skillId")
VALUES
  ('22222222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444443'),
  ('22222222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444445'),
  ('33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444')
ON CONFLICT ("userId", "skillId") DO NOTHING;

INSERT INTO public."Connections" (id, status, "creatorId", "receiverId")
VALUES
  ('55555555-5555-4555-8555-555555555551', 'accepted', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'),
  ('55555555-5555-4555-8555-555555555552', 'pending', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.conversations (id, "friendRequestId")
VALUES
  ('66666666-6666-4666-8666-666666666661', '55555555-5555-4555-8555-555555555551')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.messages (id, content, "senderId", "conversationId")
VALUES
  ('77777777-7777-4777-8777-777777777771', 'Hey Bob, ready for our coding session?', '11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-666666666661'),
  ('77777777-7777-4777-8777-777777777772', 'Yes! Let us start with NestJS modules.', '22222222-2222-4222-8222-222222222222', '66666666-6666-4666-8666-666666666661')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, "authorId", content, media)
VALUES
  ('88888888-8888-4888-8888-888888888881', '11111111-1111-4111-8111-111111111111', 'Hosting a free session on API design this weekend.', NULL),
  ('88888888-8888-4888-8888-888888888882', '22222222-2222-4222-8222-222222222222', 'Looking for a study buddy for backend architecture.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.comments (id, content, "postId", "userId")
VALUES
  ('99999999-9999-4999-8999-999999999991', 'Count me in!', '88888888-8888-4888-8888-888888888881', '22222222-2222-4222-8222-222222222222')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.post_likes (id, "postId", "userId")
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '88888888-8888-4888-8888-888888888881', '33333333-3333-4333-8333-333333333333')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.study_sessions (
  id,
  status,
  "subjectTeachId",
  "subjectLearnId",
  title,
  description,
  creatorid,
  participantid,
  scheduledat,
  link
)
VALUES (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  'confirmed',
  '44444444-4444-4444-8444-444444444443',
  '44444444-4444-4444-8444-444444444445',
  'Backend Fundamentals Exchange',
  'Alice helps Bob with NestJS and Bob practices communication skills.',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  now() + interval '2 days',
  'https://meet.example.com/learnloop-session'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.documents (id, filename, path, mimetype, session_id)
VALUES
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'session-outline.pdf', '/uploads/session-outline.pdf', 'application/pdf', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1')
ON CONFLICT (id) DO NOTHING;
