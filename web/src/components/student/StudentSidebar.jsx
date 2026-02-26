import React, { useState } from 'react';
import {
    LayoutDashboard, BookOpen, Award, User, LogOut,
    ChevronRight, Bell, Zap, Menu, X, ShieldCheck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function StudentSidebar({ isOpen, setIsOpen }) {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/student' },
        { icon: <BookOpen size={20} />, label: 'Meus Cursos', path: '/student/courses' },
        { icon: <Award size={20} />, label: 'Certificados', path: '/student/certificates' },
        { icon: <User size={20} />, label: 'Perfil', path: '/student/profile' },
    ];

    const adminItems = [
        { icon: <ShieldCheck size={20} />, label: 'Painel Admin', path: '/admin' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 transition-transform duration-300 ease-in-out shadow-lg shadow-gray-100/50
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                P
                            </div>
                            <span className="font-bold text-xl text-gray-800 tracking-tight">PET CLASS</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2 mt-4">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className={`transition-transform duration-200 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                {item.label}
                                {isActive(item.path) && <ChevronRight size={16} className="ml-auto opacity-50" />}
                            </button>
                        ))}
                    </nav>

                    {/* Admin Link */}
                    <div className="px-4 pb-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-4 mb-2">Administração</div>
                        {adminItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* User Profile (Bottom) */}
                    <div className="p-4 border-t border-gray-100 m-4 bg-gray-50/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                                    D
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate">Diego</h4>
                                <p className="text-xs text-blue-600 font-semibold truncate">Nível 5 • 2.4k XP</p>
                            </div>
                            <button className="text-gray-400 hover:text-red-500 transition-colors bg-white p-1.5 rounded-lg shadow-sm hover:shadow">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
