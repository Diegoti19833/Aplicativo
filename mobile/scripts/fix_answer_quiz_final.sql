-- ===================================================
-- SQL DE CORREÇÃO FINAL: function answer_quiz
-- Correção dos campos: selected_answer e bônus de POPCOIN
-- ===================================================

CREATE OR REPLACE FUNCTION public.answer_quiz(
    user_id_param uuid,
    quiz_id_param uuid,
    selected_option_param integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_quiz_record RECORD;
    v_is_correct boolean;
    v_attempt_id uuid;
    v_xp_reward integer;
BEGIN
    -- 1. Buscar dados do quiz
    SELECT * INTO v_quiz_record FROM quizzes WHERE id = quiz_id_param;
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Quiz não encontrado');
    END IF;

    -- 2. Verificar se está correto
    v_is_correct := (v_quiz_record.correct_answer = selected_option_param);
    v_xp_reward := CASE WHEN v_is_correct THEN COALESCE(v_quiz_record.xp_reward, 10) ELSE 0 END;

    -- 3. Inserir tentativa (USANDO A COLUNA CORRETA: selected_answer)
    INSERT INTO quiz_attempts (user_id, quiz_id, selected_answer, is_correct, xp_earned)
    VALUES (user_id_param, quiz_id_param, selected_option_param, v_is_correct, v_xp_reward)
    RETURNING id INTO v_attempt_id;

    -- 4. Se correto, dar XP e POPCOIN (coins) ao usuário
    IF v_is_correct THEN
        UPDATE users 
        SET total_xp = COALESCE(total_xp, 0) + v_xp_reward,
            coins = COALESCE(coins, 0) + GREATEST(1, v_xp_reward / 2) -- Bônus de POPCOIN
        WHERE id = user_id_param;
    END IF;

    -- Retornar resultado
    RETURN json_build_object(
        'is_correct', v_is_correct,
        'xp_earned', v_xp_reward,
        'attempt_id', v_attempt_id
    );
END;
$$;
