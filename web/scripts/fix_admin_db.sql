-- ===================================================
-- CORREÇÕES DO BANCO DE DADOS PARA O PAINEL ADMIN
-- Execute no Supabase Dashboard > SQL Editor
-- Data: 2026-02-24
-- ===================================================

-- ╔══════════════════════════════════════════════════╗
-- ║  1. REMOVER TRIGGERS PROBLEMÁTICOS              ║
-- ║  O trigger de achievements na tabela             ║
-- ║  user_progress causa erro 42703 porque           ║
-- ║  referencia coluna 'requirement_value'           ║
-- ║  que não existe.                                 ║
-- ╚══════════════════════════════════════════════════╝

-- Remove triggers problemáticos da tabela user_progress
DROP TRIGGER IF EXISTS check_achievements_trigger ON public.user_progress;
DROP TRIGGER IF EXISTS trg_check_achievements ON public.user_progress;

-- Remove a função de trigger se existir
DROP FUNCTION IF EXISTS public.check_achievements_on_progress();
DROP FUNCTION IF EXISTS public.trg_check_achievements();

-- ╔══════════════════════════════════════════════════╗
-- ║  2. GARANTIR CONSTRAINT ÚNICA EM user_progress   ║
-- ║  Necessário para ON CONFLICT funcionar           ║
-- ║  corretamente na função complete_lesson.         ║
-- ╚══════════════════════════════════════════════════╝

-- Verifica se a constraint já existe antes de criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_progress_user_id_lesson_id_progress_type_key'
  ) THEN
    ALTER TABLE public.user_progress
    ADD CONSTRAINT user_progress_user_id_lesson_id_progress_type_key
    UNIQUE (user_id, lesson_id, progress_type);
  END IF;
END $$;

-- ╔══════════════════════════════════════════════════╗
-- ║  3. RECRIAR complete_lesson SEM CONFLITOS        ║
-- ║  Versão limpa que funciona com a constraint      ║
-- ║  única criada acima.                             ║
-- ╚══════════════════════════════════════════════════╝

-- Limpa TODAS as versões (incluindo a de 2 parâmetros com nomes antigos)
DROP FUNCTION IF EXISTS public.complete_lesson(uuid, uuid, integer);
DROP FUNCTION IF EXISTS public.complete_lesson(uuid, uuid);

-- Recria com a assinatura correta (2 parâmetros)
CREATE OR REPLACE FUNCTION public.complete_lesson(
  p_user_id uuid,
  p_lesson_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lesson RECORD;
  v_xp INTEGER;
  v_coins INTEGER;
  v_result json;
BEGIN
  -- Busca dados da aula
  SELECT * INTO v_lesson FROM public.lessons WHERE id = p_lesson_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Aula não encontrada');
  END IF;

  -- Define XP e moedas padrão
  v_xp := COALESCE(v_lesson.xp_reward, 50);
  v_coins := COALESCE(v_lesson.coin_reward, 10);

  -- Insere progresso (ON CONFLICT ignora duplicatas)
  INSERT INTO public.user_progress (user_id, lesson_id, progress_type, completed, completed_at)
  VALUES (p_user_id, p_lesson_id, 'lesson', true, NOW())
  ON CONFLICT (user_id, lesson_id, progress_type) DO NOTHING;

  -- Atualiza XP e moedas do usuário
  UPDATE public.users
  SET
    total_xp = COALESCE(total_xp, 0) + v_xp,
    coins    = COALESCE(coins, 0)    + v_coins
  WHERE id = p_user_id;

  v_result := json_build_object(
    'success', true,
    'xp_earned', v_xp,
    'coins_earned', v_coins
  );

  RETURN v_result;
END;
$$;

-- ╔══════════════════════════════════════════════════╗
-- ║  4. VERIFICAÇÃO FINAL                           ║
-- ║  Confirma que as funções estão corretas.         ║
-- ╚══════════════════════════════════════════════════╝

-- Verifica funções restantes
SELECT
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('answer_quiz', 'complete_lesson')
AND n.nspname = 'public';

-- Verifica triggers na tabela user_progress (deve retornar vazio)
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_progress';

-- ✅ Pronto! Os componentes do admin que usam Supabase devem funcionar sem erros.
