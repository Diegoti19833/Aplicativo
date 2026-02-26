import React, { useState } from 'react';
import {
    Bell, Search, Flame, Award, ChevronRight, PlayCircle,
    Target, TrendingUp, BookOpen, Clock, Zap, Menu
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import StudentSidebar from './StudentSidebar';

// Mock Data
const WEEKLY_POINTS = [
    { name: 'Seg', points: 120 },
    { name: 'Ter', points: 250 },
    { name: 'Qua', points: 180 },
    { name: 'Qui', points: 300 },
    { name: 'Sex', points: 220 },
    { name: 'Sáb', points: 150 },
    { name: 'Dom', points: 90 },
];

const LESSON_DISTRIBUTION = [
    { name: 'Vendas', value: 45, color: '#3b82f6' },      // Blue 500
    { name: 'Atendimento', value: 30, color: '#60a5fa' }, // Blue 400
    { name: 'Produtos', value: 15, color: '#93c5fd' },    // Blue 300
    { name: 'Gestão', value: 10, color: '#bfdbfe' },      // Blue 200
];

const COURSES = [
    {
        id: 1,
        title: 'Técnicas de Atendimento',
        category: 'Atendimento',
        progress: 75,
        totalLessons: 12,
        completedLessons: 9,
        image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
        id: 2,
        title: 'Vendas Consultivas',
        category: 'Vendas',
        progress: 30,
        totalLessons: 8,
        completedLessons: 3,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=300&h=200'
    }
];

const ACHIEVEMENTS = [
    { id: 1, icon: <Award size={20} />, title: 'Vendedor Nato', color: 'bg-yellow-100 text-yellow-600' },
    { id: 2, icon: <Zap size={20} />, title: 'Rápido no Gatilho', color: 'bg-blue-100 text-blue-600' },
    { id: 3, icon: <Flame size={20} />, title: 'Sequência de 7 Dias', color: 'bg-orange-100 text-orange-600' },
];

export default function StudentDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            <StudentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-6 md:p-8 overflow-y-auto">
                {/* Header (Greeting + Search + Bells) */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Olá, Diego! 👋</h1>
                        <p className="text-gray-500">Vamos continuar seu aprendizado hoje?</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                placeholder="Buscar cursos..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
                            />
                        </div>
                        <button className="relative p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                            <Bell size={20} className="text-gray-600" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button
                            className="md:hidden p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </header>

                <div className="space-y-6">
                    {/* Top Row: Progress + Achievements */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Progress Card */}
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 blur-3xl opacity-50 transition-opacity group-hover:opacity-100"></div>

                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                        <Target size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">Meu Progresso</h3>
                                        <p className="text-sm text-gray-500">Nível 5 - Especialista</p>
                                    </div>
                                </div>
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold font-mono">
                                    2.400 / 3.000 XP
                                </div>
                            </div>

                            <div className="relative pt-2 pb-1">
                                <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                                    <span>Progresso Atual</span>
                                    <span>80%</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000"
                                        style={{ width: '80%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Achievements Card */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">Conquistas Recentes</h3>
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">Ver todas</button>
                            </div>
                            <div className="flex justify-between gap-2">
                                {ACHIEVEMENTS.map(ach => (
                                    <div key={ach.id} className="flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${ach.color} transition-transform group-hover:scale-110 shadow-sm ring-4 ring-gray-50`}>
                                            {ach.icon}
                                        </div>
                                        <span className="text-[10px] font-bold text-center text-gray-600 leading-tight w-16">{ach.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle Row: Courses + Daily Goal */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Continue Learning (2/3) */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                    <BookOpen size={20} className="text-blue-600" />
                                    Continue Aprendendo
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {COURSES.map(course => (
                                    <div key={course.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1 block">{course.category}</span>
                                                    <h4 className="font-bold text-gray-900 leading-tight mb-2 truncate" title={course.title}>{course.title}</h4>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span>{course.progress}% concluído</span>
                                                        <span>{course.completedLessons}/{course.totalLessons} aulas</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${course.progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="self-center p-2 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <PlayCircle size={20} fill="currentColor" className="opacity-80" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daily Goal Widget (1/3) */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Target size={120} />
                            </div>

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-blue-100">
                                        <Flame size={18} className="text-orange-400 fill-orange-400 animate-pulse" />
                                        <span className="text-sm font-bold uppercase tracking-wider">Meta Diária</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-1">2/3 Aulas</h3>
                                    <p className="text-blue-100 text-sm">Complete mais uma aula para manter sua ofensiva!</p>
                                </div>

                                <div className="mt-6">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span>Progresso</span>
                                        <span>66%</span>
                                    </div>
                                    <div className="h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div className="h-full bg-white rounded-full w-2/3 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                    </div>
                                    <button className="mt-6 w-full py-2.5 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm">
                                        Continuar Agora
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bar Chart (2/3) */}
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Pontos por Semana</h3>
                                    <p className="text-sm text-gray-500">Sua atividade nos últimos 7 dias</p>
                                </div>
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-bold">
                                    <TrendingUp size={16} /> +12%
                                </div>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={WEEKLY_POINTS}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Bar
                                            dataKey="points"
                                            fill="#3b82f6"
                                            radius={[6, 6, 0, 0]}
                                            barSize={32}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart (1/3) */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 text-lg mb-6">Distribuição de Aulas</h3>
                            <div className="h-48 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={LESSON_DISTRIBUTION}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {LESSON_DISTRIBUTION.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Stats */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-bold text-gray-900">24</span>
                                    <span className="text-xs text-gray-500 font-medium">Aulas Total</span>
                                </div>
                            </div>

                            <div className="space-y-3 mt-4">
                                {LESSON_DISTRIBUTION.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-gray-600 font-medium">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
