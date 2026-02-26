-- ===================================================
-- SQL para REINICIAR e inserir aulas na Trilha de Liderança
-- Ordem: Aula de Vídeo em 1º lugar para teste rápido
-- ===================================================

DO $$
DECLARE
  v_trail_id UUID := '550e8400-e29b-41d4-a716-446655440004';
  v_l1 UUID; v_l2 UUID; v_l3 UUID; v_l4 UUID; v_l5 UUID;
BEGIN

-- 0. Limpar aulas e quizzes anteriores desta trilha para evitar conflitos de ordem
DELETE FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE trail_id = v_trail_id);
DELETE FROM lessons WHERE trail_id = v_trail_id;

RAISE NOTICE 'Banco de dados limpo para a Trilha de Liderança.';

-- ─── AULA 1 (COM VÍDEO): Gestão de Conflitos na Equipe ───────────────────────
INSERT INTO lessons (trail_id, title, description, order_index, xp_reward, is_active, video_url, lesson_type)
VALUES (v_trail_id, 'Gestão de Conflitos na Equipe', 'Assista ao vídeo e aprenda a transformar conflitos em crescimento.', 1, 40, true, 'https://www.youtube.com/watch?v=eY8lPOdMtqE', 'video')
RETURNING id INTO v_l1;

INSERT INTO quizzes(lesson_id, title, question, options, correct_answer, explanation, xp_reward, order_index, is_active) VALUES
(v_l1, 'Ação do líder', 'Líder diante de um conflito deve:', '["Ignorar e esperar passar","Tomar partido","Mediar ouvindo todos os lados","Punir ambos"]', 2, 'O líder deve agir como mediador neutro.', 10, 1, true),
(v_l1, 'Ambiente seguro', 'Um bom líder em conflito deve:', '["Não se envolver","Resolver por e-mail","Criar ambiente seguro para conversa","Esconder o problema"]', 2, 'Segurança psicológica permite resolução honesta.', 10, 2, true);

-- ─── AULA 2: O que é Liderança de Verdade? ───────────────────────────────────
INSERT INTO lessons (trail_id, title, description, order_index, xp_reward, is_active, video_url, lesson_type)
VALUES (v_trail_id, 'O que é Liderança de Verdade?', 'Entenda a diferença entre chefe e líder.', 2, 30, true, null, 'quiz')
RETURNING id INTO v_l2;

INSERT INTO quizzes(lesson_id, title, question, options, correct_answer, explanation, xp_reward, order_index, is_active) VALUES
(v_l2, 'Chefe vs Líder', 'Qual a principal diferença entre um chefe e um líder?', '["O chefe manda, o líder inspira","O chefe ganha mais","O chefe tem mais experiência","O chefe trabalha mais"]', 0, 'Um líder inspira e motiva a equipe.', 10, 1, true);

-- ─── AULA 3: Comunicação que Engaja ──────────────────────────────────────────
INSERT INTO lessons (trail_id, title, description, order_index, xp_reward, is_active, video_url, lesson_type)
VALUES (v_trail_id, 'Comunicação que Engaja', 'Técnicas de comunicação assertiva.', 3, 30, true, null, 'quiz')
RETURNING id INTO v_l3;

INSERT INTO quizzes(lesson_id, title, question, options, correct_answer, explanation, xp_reward, order_index, is_active) VALUES
(v_l3, 'Assertividade', 'Comunicação assertiva significa:', '["Falar em voz alta","Expressar com clareza e respeito","Nunca discordar","Evitar conversas difíceis"]', 1, 'Assertividade é clareza sem agressividade.', 10, 1, true);

-- ─── AULA 4: Tomada de Decisão Sob Pressão ───────────────────────────────────
INSERT INTO lessons (trail_id, title, description, order_index, xp_reward, is_active, video_url, lesson_type)
VALUES (v_trail_id, 'Tomada de Decisão Sob Pressão', 'Métodos para decisões rápidas.', 4, 35, true, null, 'quiz')
RETURNING id INTO v_l4;

INSERT INTO quizzes(lesson_id, title, question, options, correct_answer, explanation, xp_reward, order_index, is_active) VALUES
(v_l4, 'Decisão', 'Técnica para decisão rápida:', '["Por instinto","Método Prós e Contras","Perguntar a todos","Adiar"]', 1, 'Prós e contras visualiza impactos.', 10, 1, true);

-- ─── AULA 5: Motivação e Engajamento da Equipe ───────────────────────────────
INSERT INTO lessons (trail_id, title, description, order_index, xp_reward, is_active, video_url, lesson_type)
VALUES (v_trail_id, 'Motivação e Engajamento da Equipe', 'Crie um ambiente motivador.', 5, 35, true, null, 'quiz')
RETURNING id INTO v_l5;

INSERT INTO quizzes(lesson_id, title, question, options, correct_answer, explanation, xp_reward, order_index, is_active) VALUES
(v_l5, 'Motivador', 'Qual é um poderoso motivador intrínseco?', '["Apenas salário","Sentido e propósito no trabalho","Pressão","Competição"]', 1, 'Pessoas engajadas buscam significado.', 10, 1, true);

RAISE NOTICE 'Aulas reiniciadas com sucesso! Aula de VÍDEO agora é a primeira.';
END $$;
