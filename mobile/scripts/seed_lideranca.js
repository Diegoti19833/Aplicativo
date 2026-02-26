// Script para inserir aulas na Trilha de Liderança
// Execute com: node scripts/seed_lideranca.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ijbdkochrgafvpicpncc.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqYmRrb2NocmdhZnZwaWNwbmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTA0NTcsImV4cCI6MjA3NTk4NjQ1N30.AmbW_h7YD2C-9UedfRb-cvRtDF1ypjdBhYwGi-hxUso';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── DADOS DAS AULAS ─────────────────────────────────────────────────────────
const LESSONS = [
    {
        title: 'O que é Liderança de Verdade?',
        description: 'Entenda a diferença entre chefe e líder, e como influenciar sua equipe de forma positiva.',
        order_index: 1,
        xp_reward: 30,
        duration_minutes: 8,
        is_active: true,
        video_url: null, // sem vídeo
        quizzes: [
            {
                question: 'Qual é a principal diferença entre um chefe e um líder?',
                options: JSON.stringify(['O chefe manda, o líder inspira', 'O chefe ganha mais salário', 'O chefe tem mais experiência', 'O chefe trabalha mais horas']),
                correct_answer_index: 0,
                explanation: 'Um líder inspira e motiva a equipe, enquanto um chefe apenas dá ordens.',
                xp_reward: 10,
            },
            {
                question: 'Qual comportamento é essencial em um bom líder?',
                options: JSON.stringify(['Tomar todas as decisões sozinho', 'Escutar ativamente sua equipe', 'Nunca admitir erros', 'Evitar feedback']),
                correct_answer_index: 1,
                explanation: 'Escuta ativa fortalece o vínculo com a equipe e melhora a tomada de decisão.',
                xp_reward: 10,
            },
            {
                question: 'Liderança é uma habilidade:',
                options: JSON.stringify(['Inata, com a qual se nasce', 'Apenas para quem tem cargo alto', 'Que pode ser desenvolvida por qualquer pessoa', 'Exclusiva de pessoas extrovertidas']),
                correct_answer_index: 2,
                explanation: 'A liderança pode ser aprendida e desenvolvida ao longo do tempo com prática e autoconhecimento.',
                xp_reward: 10,
            },
        ],
    },
    {
        title: 'Comunicação que Engaja',
        description: 'Aprenda técnicas de comunicação clara, assertiva e motivadora para conduzir sua equipe com confiança.',
        order_index: 2,
        xp_reward: 30,
        duration_minutes: 10,
        is_active: true,
        video_url: null,
        quizzes: [
            {
                question: 'Comunicação assertiva significa:',
                options: JSON.stringify(['Falar sempre em voz alta', 'Expressar ideias com clareza e respeito', 'Nunca discordar da equipe', 'Evitar conversas difíceis']),
                correct_answer_index: 1,
                explanation: 'Assertividade é expressar pensamentos e sentimentos com clareza, sem agressividade e sem passividade.',
                xp_reward: 10,
            },
            {
                question: 'O que é escuta ativa?',
                options: JSON.stringify(['Ouvir enquanto faz outra coisa', 'Concordar com tudo que é dito', 'Prestar atenção plena ao que o outro fala', 'Interromper para dar opinião']),
                correct_answer_index: 2,
                explanation: 'Escuta ativa envolve presença total, sem distrações, sinalizando compreensão ao interlocutor.',
                xp_reward: 10,
            },
            {
                question: 'Qual é um exemplo de feedback construtivo?',
                options: JSON.stringify(['"Você é péssimo nisso"', '"Tente melhorar algo"', '"Quando você faz X, o resultado é Y. Que tal tentar Z?"', 'Não falar nada para não desmotivar']),
                correct_answer_index: 2,
                explanation: 'Feedback construtivo é específico, focado no comportamento e propõe melhoria concreta.',
                xp_reward: 10,
            },
        ],
    },
    {
        title: '🎥 Gestão de Conflitos na Equipe',
        description: 'Assista ao vídeo e aprenda como um líder pode transformar conflitos em oportunidades de crescimento.',
        order_index: 3,
        xp_reward: 40,
        duration_minutes: 12,
        is_active: true,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // placeholder (substituir por vídeo real)
        quizzes: [
            {
                question: 'Como um líder deve agir diante de um conflito entre membros da equipe?',
                options: JSON.stringify(['Ignorar e esperar passar', 'Tomar partido de quem tem razão', 'Mediar a conversa ouvindo todos os lados', 'Punir ambos os envolvidos']),
                correct_answer_index: 2,
                explanation: 'O líder deve agir como mediador neutro, criando espaço para que todos sejam ouvidos e a solução seja construída em conjunto.',
                xp_reward: 10,
            },
            {
                question: 'Conflitos na equipe, quando bem gerenciados, podem:',
                options: JSON.stringify(['Sempre prejudicar o clima', 'Gerar crescimento e novas ideias', 'Ser ignorados com segurança', 'Resolver-se sozinhos']),
                correct_answer_index: 1,
                explanation: 'Conflitos bem mediados estimulam criatividade, revelam problemas ocultos e fortalecem o time.',
                xp_reward: 10,
            },
            {
                question: 'Qual é a primeira etapa para resolver um conflito?',
                options: JSON.stringify(['Aplicar punição imediata', 'Identificar a causa raiz do problema', 'Transferir um dos funcionários', 'Chamar o RH']),
                correct_answer_index: 1,
                explanation: 'Entender a verdadeira causa do conflito é fundamental antes de tentar qualquer solução.',
                xp_reward: 10,
            },
            {
                question: 'Um bom líder diante de conflito deve:',
                options: JSON.stringify(['Ficar neutro e não se envolver', 'Resolver tudo por e-mail', 'Criar ambiente seguro para conversa aberta', 'Esconder o problema da diretoria']),
                correct_answer_index: 2,
                explanation: 'Criar um ambiente de segurança psicológica permite que a equipe resolva conflitos com honestidade.',
                xp_reward: 10,
            },
        ],
    },
    {
        title: 'Tomada de Decisão Sob Pressão',
        description: 'Descubra métodos práticos para tomar decisões rápidas e eficazes mesmo em situações de alta pressão.',
        order_index: 4,
        xp_reward: 35,
        duration_minutes: 9,
        is_active: true,
        video_url: null,
        quizzes: [
            {
                question: 'Qual técnica ajuda a estruturar uma decisão rápida?',
                options: JSON.stringify(['Decidir por instinto sempre', 'Método Pros & Contras', 'Perguntar a todos da equipe', 'Adiar ao máximo a decisão']),
                correct_answer_index: 1,
                explanation: 'Listar prós e contras ajuda a visualizar rapidamente os impactos de uma decisão.',
                xp_reward: 10,
            },
            {
                question: 'Em situação de crise, o líder deve:',
                options: JSON.stringify(['Transferir a responsabilidade', 'Manter a calma e comunicar claramente', 'Ser agressivo para mostrar autoridade', 'Esperar alguém resolver']),
                correct_answer_index: 1,
                explanation: 'Líderes eficazes mantêm a serenidade sob pressão e comunicam seus planos com clareza.',
                xp_reward: 10,
            },
            {
                question: 'Decisão reversível x irreversível: qual a diferença prática?',
                options: JSON.stringify(['Não tem diferença', 'Reversíveis precisam de mais análise', 'Irreversíveis exigem mais cuidado e análise', 'Reversíveis são sempre melhores']),
                correct_answer_index: 2,
                explanation: 'Decisões irreversíveis têm consequências permanentes, por isso exigem maior análise antes da ação.',
                xp_reward: 10,
            },
        ],
    },
    {
        title: 'Motivação e Engajamento da Equipe',
        description: 'Aprenda como criar um ambiente motivador, reconhecer talentos e manter sua equipe engajada no dia a dia.',
        order_index: 5,
        xp_reward: 35,
        duration_minutes: 10,
        is_active: true,
        video_url: null,
        quizzes: [
            {
                question: 'Qual é um poderoso motivador intrínseco para colaboradores?',
                options: JSON.stringify(['Apenas o salário', 'Sentido e propósito no trabalho', 'Pressão por resultados', 'Competição constante entre colegas']),
                correct_answer_index: 1,
                explanation: 'Pessoas engajadas encontram significado no que fazem, não apenas recompensa financeira.',
                xp_reward: 10,
            },
            {
                question: 'Reconhecimento no trabalho deve ser:',
                options: JSON.stringify(['Apenas financeiro', 'Só em avaliações anuais', 'Frequente, específico e sincero', 'Reservado para os melhores funcionários']),
                correct_answer_index: 2,
                explanation: 'Reconhecimento frequente e específico tem mais impacto na motivação do que grandes premiações esporádicas.',
                xp_reward: 10,
            },
            {
                question: 'O que é autonomia e por que ela motiva?',
                options: JSON.stringify(['Trabalhar sem supervisor', 'Liberdade para tomar decisões dentro do escopo', 'Fazer o que quiser', 'Trabalhar em horário flexível apenas']),
                correct_answer_index: 1,
                explanation: 'Autonomia gera senso de responsabilidade e confiança, aumentando o comprometimento da equipe.',
                xp_reward: 10,
            },
            {
                question: 'Um líder que mantém a equipe engajada geralmente:',
                options: JSON.stringify(['Microgerencia cada tarefa', 'Define metas claras e dá espaço para crescimento', 'Evita dar feedback para não pressionar', 'Nunca delega']),
                correct_answer_index: 1,
                explanation: 'Clareza de objetivos aliada à autonomia é a combinação ideal para engajamento sustentável.',
                xp_reward: 10,
            },
        ],
    },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('🚀 Iniciando seed da Trilha de Liderança...\n');

    // 1. Buscar trilha de Liderança
    const { data: trails, error: trailsError } = await supabase
        .from('trails')
        .select('id, title')
        .ilike('title', '%liderança%')
        .limit(5);

    if (trailsError) {
        console.error('❌ Erro ao buscar trilhas:', trailsError.message);
        process.exit(1);
    }

    if (!trails || trails.length === 0) {
        console.log('⚠️  Nenhuma trilha de Liderança encontrada. Listando todas as trilhas...');
        const { data: allTrails } = await supabase.from('trails').select('id, title').limit(20);
        console.log('Trilhas disponíveis:');
        allTrails?.forEach(t => console.log(`  - [${t.id}] ${t.title}`));
        process.exit(1);
    }

    const trail = trails[0];
    console.log(`✅ Trilha encontrada: "${trail.title}" (ID: ${trail.id})\n`);

    // 2. Verificar aulas existentes
    const { data: existingLessons } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .eq('trail_id', trail.id)
        .order('order_index');

    console.log(`📚 Aulas existentes: ${existingLessons?.length || 0}`);
    existingLessons?.forEach(l => console.log(`  - [${l.order_index}] ${l.title}`));
    console.log('');

    // 3. Inserir cada aula
    for (const lesson of LESSONS) {
        const { quizzes, ...lessonData } = lesson;

        // Verificar se já existe aula com mesmo order_index
        const exists = existingLessons?.find(l => l.order_index === lessonData.order_index);
        if (exists) {
            console.log(`⏭️  Aula ${lessonData.order_index} "${lessonData.title}" já existe. Pulando...`);
            continue;
        }

        // Inserir aula
        const { data: insertedLesson, error: lessonError } = await supabase
            .from('lessons')
            .insert({ ...lessonData, trail_id: trail.id })
            .select()
            .single();

        if (lessonError) {
            console.error(`❌ Erro ao inserir aula "${lessonData.title}":`, lessonError.message);
            continue;
        }

        console.log(`✅ Aula inserida: "${insertedLesson.title}" (ID: ${insertedLesson.id})${lessonData.video_url ? ' 🎥 com vídeo' : ''}`);

        // 4. Inserir quizzes da aula
        for (let i = 0; i < quizzes.length; i++) {
            const quiz = quizzes[i];
            const { error: quizError } = await supabase
                .from('quizzes')
                .insert({
                    lesson_id: insertedLesson.id,
                    question: quiz.question,
                    options: quiz.options,
                    correct_answer_index: quiz.correct_answer_index,
                    correct_answer: quiz.correct_answer_index,
                    explanation: quiz.explanation,
                    xp_reward: quiz.xp_reward,
                    order_index: i + 1,
                    is_active: true,
                });

            if (quizError) {
                console.error(`  ❌ Erro ao inserir quiz ${i + 1}:`, quizError.message);
            } else {
                console.log(`  ✅ Quiz ${i + 1} inserido: "${quiz.question.substring(0, 50)}..."`);
            }
        }
        console.log('');
    }

    console.log('🎉 Seed concluído com sucesso!');
}

main().catch(console.error);
