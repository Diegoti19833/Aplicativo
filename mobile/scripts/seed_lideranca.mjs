// Script para inserir aulas na Trilha de Liderança
// Sem campo duration_minutes (não existe no schema)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ijbdkochrgafvpicpncc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqYmRrb2NocmdhZnZwaWNwbmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTA0NTcsImV4cCI6MjA3NTk4NjQ1N30.AmbW_h7YD2C-9UedfRb-cvRtDF1ypjdBhYwGi-hxUso';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRAIL_ID = '550e8400-e29b-41d4-a716-446655440004';

// Primeiro verifica as colunas da tabela lessons
async function getColumns() {
    const { data, error } = await supabase.from('lessons').select('*').limit(1);
    if (error) { console.log('Erro:', error.message); return null; }
    if (data && data[0]) {
        console.log('Colunas disponíveis:', Object.keys(data[0]).join(', '));
        return Object.keys(data[0]);
    }
    // Se tabela vazia, tenta inserção com campos mínimos
    return ['id', 'trail_id', 'title', 'description', 'order_index', 'is_active', 'xp_reward', 'video_url'];
}

const LESSONS = [
    {
        title: 'O que é Liderança de Verdade?',
        description: 'Entenda a diferença entre chefe e líder, e como influenciar sua equipe de forma positiva.',
        order_index: 1,
        xp_reward: 30,
        is_active: true,
        video_url: null,
        quizzes: [
            { question: 'Qual é a principal diferença entre um chefe e um líder?', options: ['O chefe manda, o líder inspira', 'O chefe ganha mais salário', 'O chefe tem mais experiência', 'O chefe trabalha mais horas'], correct_answer_index: 0, explanation: 'Um líder inspira e motiva a equipe, enquanto um chefe apenas dá ordens.' },
            { question: 'Qual comportamento é essencial em um bom líder?', options: ['Tomar todas as decisões sozinho', 'Escutar ativamente sua equipe', 'Nunca admitir erros', 'Evitar feedback'], correct_answer_index: 1, explanation: 'Escuta ativa fortalece o vínculo com a equipe e melhora a tomada de decisão.' },
            { question: 'Liderança é uma habilidade:', options: ['Inata, com a qual se nasce', 'Apenas para quem tem cargo alto', 'Que pode ser desenvolvida por qualquer pessoa', 'Exclusiva de pessoas extrovertidas'], correct_answer_index: 2, explanation: 'A liderança pode ser aprendida e desenvolvida com prática e autoconhecimento.' },
        ],
    },
    {
        title: 'Comunicação que Engaja',
        description: 'Aprenda técnicas de comunicação clara, assertiva e motivadora para conduzir sua equipe com confiança.',
        order_index: 2,
        xp_reward: 30,
        is_active: true,
        video_url: null,
        quizzes: [
            { question: 'Comunicação assertiva significa:', options: ['Falar sempre em voz alta', 'Expressar ideias com clareza e respeito', 'Nunca discordar da equipe', 'Evitar conversas difíceis'], correct_answer_index: 1, explanation: 'Assertividade é expressar pensamentos com clareza, sem agressividade e sem passividade.' },
            { question: 'O que é escuta ativa?', options: ['Ouvir enquanto faz outra coisa', 'Concordar com tudo que é dito', 'Prestar atenção plena ao que o outro fala', 'Interromper para dar opinião'], correct_answer_index: 2, explanation: 'Escuta ativa envolve presença total, sinalizando compreensão ao interlocutor.' },
            { question: 'Qual é um exemplo de feedback construtivo?', options: ['"Você é péssimo nisso"', '"Tente melhorar algo"', '"Quando você faz X, o resultado é Y. Que tal tentar Z?"', 'Não falar nada para não desmotivar'], correct_answer_index: 2, explanation: 'Feedback construtivo é específico e propõe melhoria concreta.' },
        ],
    },
    {
        title: 'Gestão de Conflitos na Equipe',
        description: 'Assista ao vídeo e aprenda como um líder transforma conflitos em oportunidades de crescimento.',
        order_index: 3,
        xp_reward: 40,
        is_active: true,
        video_url: 'https://www.youtube.com/watch?v=eY8lPOdMtqE',
        quizzes: [
            { question: 'Como um líder deve agir diante de um conflito entre membros?', options: ['Ignorar e esperar passar', 'Tomar partido de quem tem razão', 'Mediar a conversa ouvindo todos os lados', 'Punir ambos os envolvidos'], correct_answer_index: 2, explanation: 'O líder deve agir como mediador neutro.' },
            { question: 'Conflitos bem gerenciados podem:', options: ['Sempre prejudicar o clima', 'Gerar crescimento e novas ideias', 'Ser ignorados com segurança', 'Resolver-se sozinhos'], correct_answer_index: 1, explanation: 'Conflitos mediados estimulam criatividade e fortalecem o time.' },
            { question: 'Qual é a primeira etapa para resolver um conflito?', options: ['Aplicar punição imediata', 'Identificar a causa raiz', 'Transferir um dos funcionários', 'Chamar o RH imediatamente'], correct_answer_index: 1, explanation: 'Entender a causa raiz é fundamental antes de qualquer solução.' },
            { question: 'Um bom líder diante de conflito deve:', options: ['Ficar neutro e não se envolver', 'Resolver tudo por e-mail', 'Criar ambiente seguro para conversa aberta', 'Esconder o problema'], correct_answer_index: 2, explanation: 'Segurança psicológica permite resolução honesta de conflitos.' },
        ],
    },
    {
        title: 'Tomada de Decisão Sob Pressão',
        description: 'Descubra métodos práticos para tomar decisões rápidas e eficazes em situações de alta pressão.',
        order_index: 4,
        xp_reward: 35,
        is_active: true,
        video_url: null,
        quizzes: [
            { question: 'Qual técnica ajuda a estruturar uma decisão rápida?', options: ['Decidir por instinto sempre', 'Método Prós e Contras', 'Perguntar a todos da equipe', 'Adiar ao máximo'], correct_answer_index: 1, explanation: 'Listar prós e contras visualiza rapidamente os impactos de uma decisão.' },
            { question: 'Em situação de crise, o líder deve:', options: ['Transferir a responsabilidade', 'Manter a calma e comunicar claramente', 'Ser agressivo para mostrar autoridade', 'Esperar alguém resolver'], correct_answer_index: 1, explanation: 'Líderes eficazes mantêm serenidade e comunicam planos com clareza.' },
            { question: 'Decisões irreversíveis exigem:', options: ['Ação imediata sem pensar', 'Mais cuidado e análise prévia', 'Delegação para a equipe', 'Aprovação dos clientes'], correct_answer_index: 1, explanation: 'Decisões irreversíveis têm consequências permanentes, precisam de mais análise.' },
        ],
    },
    {
        title: 'Motivação e Engajamento da Equipe',
        description: 'Aprenda como criar um ambiente motivador, reconhecer talentos e manter sua equipe engajada.',
        order_index: 5,
        xp_reward: 35,
        is_active: true,
        video_url: null,
        quizzes: [
            { question: 'Qual é um poderoso motivador intrínseco?', options: ['Apenas o salário', 'Sentido e propósito no trabalho', 'Pressão por resultados', 'Competição constante'], correct_answer_index: 1, explanation: 'Pessoas engajadas encontram significado no que fazem.' },
            { question: 'Reconhecimento no trabalho deve ser:', options: ['Apenas financeiro', 'Só em avaliações anuais', 'Frequente, específico e sincero', 'Reservado para os melhores'], correct_answer_index: 2, explanation: 'Reconhecimento frequente e específico tem mais impacto.' },
            { question: 'Um líder engajador geralmente:', options: ['Microgerencia cada tarefa', 'Define metas claras e dá espaço para crescimento', 'Evita feedback', 'Nunca delega'], correct_answer_index: 1, explanation: 'Clareza de objetivos + autonomia = engajamento sustentável.' },
            { question: 'Autonomia na equipe gera:', options: ['Desorganização', 'Senso de responsabilidade e comprometimento', 'Menos produtividade', 'Conflitos constantes'], correct_answer_index: 1, explanation: 'Autonomia gera responsabilidade e confiança.' },
        ],
    },
];

async function main() {
    console.log('🚀 Inserindo aulas na Trilha de Liderança...\n');

    // Verificar colunas disponíveis
    const columns = await getColumns();
    console.log('');

    // Buscar aulas existentes
    const { data: existing } = await supabase
        .from('lessons').select('id, title, order_index').eq('trail_id', TRAIL_ID).order('order_index');
    console.log(`📚 Existentes: ${existing?.length || 0}`);

    for (const lesson of LESSONS) {
        const { quizzes, ...lessonData } = lesson;

        if (existing?.find(l => l.order_index === lessonData.order_index)) {
            console.log(`⏭️  Pulando aula ${lessonData.order_index} (já existe)`);
            continue;
        }

        const payload = { ...lessonData, trail_id: TRAIL_ID };
        // Remover campos que podem não existir
        delete payload.duration_minutes;

        const { data: ins, error: le } = await supabase
            .from('lessons').insert(payload).select().single();

        if (le) {
            console.error(`❌ "${lessonData.title}":`, le.message);
            continue;
        }

        console.log(`✅ "${ins.title}"${lessonData.video_url ? ' 🎥 vidéo' : ''}`);

        for (let i = 0; i < quizzes.length; i++) {
            const q = quizzes[i];
            const { error: qe } = await supabase.from('quizzes').insert({
                lesson_id: ins.id,
                question: q.question,
                options: JSON.stringify(q.options),
                correct_answer_index: q.correct_answer_index,
                correct_answer: q.correct_answer_index,
                explanation: q.explanation,
                xp_reward: 10,
                order_index: i + 1,
                is_active: true,
            });
            if (qe) console.error(`  ❌ Quiz ${i + 1}:`, qe.message);
            else console.log(`  ✔ Quiz ${i + 1}`);
        }
    }
    console.log('\n🎉 Concluído!');
}

main().catch(console.error);
