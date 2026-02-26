-- ===================================================
-- SQL para CORRIGIR erros de RPC (Ambiguidade/Sobrecarga)
-- Execute no Supabase Dashboard > SQL Editor
-- ===================================================

-- 1. Remover versões antigas da função answer_quiz para evitar confusão do PostgREST
-- Mantemos a versão que aceita (uuid, uuid, integer)
DROP FUNCTION IF EXISTS public.answer_quiz(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.answer_quiz(user_id_param uuid, quiz_id_param uuid, selected_option_param text);
DROP FUNCTION IF EXISTS public.answer_quiz(user_id_param uuid, quiz_id_param uuid, selected_option_param uuid);

-- 2. Remover versão antiga da função complete_lesson
-- Mantemos a versão com 2 parâmetros utilizada pelo App Mobile
-- (Se houver uma versão com 3 parâmetros sem valor default, ela causa ambiguidade)
DROP FUNCTION IF EXISTS public.complete_lesson(uuid, uuid, integer);
DROP FUNCTION IF EXISTS public.complete_lesson(user_id_param uuid, lesson_id_param uuid, xp_earned_param integer);

-- 3. Verificar quais assinaturas restaram
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('answer_quiz', 'complete_lesson')
AND n.nspname = 'public';

-- Limpeza concluída! Tente responder o quiz e completar a aula novamente no App Mobile.
