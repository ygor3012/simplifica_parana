import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import AppHeader from "@/components/AppHeader";
import TaskModal from "@/components/TaskModal";
import { useState } from "react";
import { BookOpen, ArrowRight, GraduationCap, Users, CheckCircle } from "lucide-react";

import { useLocation } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663581549450/miB6HanbY7uDLSpWUY8oNy/logo-simplifica-nsCmT7SsdtGqLsvCacBHPy.webp";
const BANNER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663581549450/miB6HanbY7uDLSpWUY8oNy/banner-simplifica-aVzCxvANvBwWLFtdqJUmHR.webp";

// Definição das plataformas educacionais do Paraná
const PLATFORMS = [
  {
    id: "Redacao",
    label: "Redação Paraná",
    emoji: "✍️",
    logo: "/manus-storage/logo-redacao_cf0624be.png",
    color: "bg-gradient-to-br from-rose-500 to-pink-600",
    lightColor: "bg-rose-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
  },
  {
    id: "Leia",
    label: "Leia Paraná",
    emoji: "📚",
    logo: "/manus-storage/logo-leia_8d37f6d6.jpg",
    color: "bg-gradient-to-br from-emerald-500 to-teal-600",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
  },
  {
    id: "Teens",
    label: "Inglês Teens",
    emoji: "🌍",
    logo: "/manus-storage/logo-ingles-teens_cc151207.png",
    color: "bg-gradient-to-br from-sky-500 to-blue-600",
    lightColor: "bg-sky-50",
    textColor: "text-sky-600",
    borderColor: "border-sky-200",
  },
  {
    id: "High",
    label: "Inglês High",
    emoji: "🎓",
    logo: "/manus-storage/logo-ingles-high_28f16c18.png",
    color: "bg-gradient-to-br from-violet-500 to-purple-600",
    lightColor: "bg-violet-50",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
  },
  {
    id: "Desafio",
    label: "Desafio PR",
    emoji: "🏆",
    logo: "/manus-storage/logo-desafio_d580efcf.png",
    color: "bg-gradient-to-br from-amber-500 to-orange-600",
    lightColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
  },
  {
    id: "Khan",
    label: "Khan Academy",
    emoji: "🔬",
    logo: "/manus-storage/logo-khan_1b6cd2b0.png",
    color: "bg-gradient-to-br from-green-500 to-emerald-600",
    lightColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200",
  },
  {
    id: "Matific",
    label: "Matific",
    emoji: "🔢",
    logo: "/manus-storage/logo-matific_4241cac5.png",
    color: "bg-gradient-to-br from-blue-500 to-indigo-600",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    id: "Class",
    label: "Google Classroom",
    emoji: "🖥️",
    logo: "/manus-storage/logo-classroom_a9c2ae9e.png",
    color: "bg-gradient-to-br from-cyan-500 to-blue-600",
    lightColor: "bg-cyan-50",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-200",
  },
  {
    id: "Quizziz",
    label: "Quizziz",
    emoji: "❓",
    logo: "/manus-storage/logo-quizziz_1223c9d7.jpg",
    color: "bg-gradient-to-br from-fuchsia-500 to-purple-600",
    lightColor: "bg-fuchsia-50",
    textColor: "text-fuchsia-600",
    borderColor: "border-fuchsia-200",
  },
];

function ProgressRing({ percent, size = 180 }: { percent: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PlatformCard({
  platform,
  progress,
  pendingCount,
  onClick,
}: {
  platform: (typeof PLATFORMS)[0];
  progress: number;
  pendingCount: number;
  onClick: () => void;
}) {
  const circumference = 2 * Math.PI * 76;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-250 hover:-translate-y-1"
    >
      {/* Badge de alerta */}
      {pendingCount > 0 && (
        <span className="absolute top-2 right-2 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
          {pendingCount > 99 ? "99+" : pendingCount}
        </span>
      )}

      {/* Círculo de progresso */}
      <div className="relative w-[168px] h-[168px] flex items-center justify-center">
        <svg width="168" height="168" className="absolute rotate-[-90deg]">
          <circle cx="84" cy="84" r="76" fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle
            cx="84"
            cy="84"
            r="76"
            fill="none"
            stroke="url(#grad-{platform.id})"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
          <defs>
            <linearGradient id={`grad-${platform.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Inner circle */}
        <div className={`w-[148px] h-[148px] rounded-full ${platform.lightColor} flex flex-col items-center justify-center gap-1 group-hover:scale-105 transition-transform`}>
          {platform.logo ? (
            <img src={platform.logo} alt={platform.label} className="w-20 h-20 object-contain" />
          ) : (
            <span className="text-3xl">{platform.emoji}</span>
          )}
          <span className={`text-lg font-bold ${platform.textColor}`}>{progress}%</span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-800 leading-tight">{platform.label}</p>
        {pendingCount > 0 ? (
          <p className="text-xs text-red-500 mt-0.5">{pendingCount} pendente{pendingCount !== 1 ? "s" : ""}</p>
        ) : (
          <p className="text-xs text-gray-400 mt-0.5">Em dia ✓</p>
        )}
      </div>
    </button>
  );
}

// ─── Landing Page (não logado) ────────────────────────────────────────────────

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-100/60 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 pt-20 pb-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Plataforma Educacional do Paraná
            </div>

            {/* Logo grande */}
            <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-xl">
                <img src={LOGO_URL} alt="Logo Simplifica Paraná" className="w-full h-full object-cover" />
            </div>
              <div className="text-left">
                <h1 className="text-5xl font-extrabold text-gray-900 leading-none">Simplifica</h1>
                <p className="text-3xl font-bold text-blue-600 leading-none">Paraná</p>
              </div>
            </div>

            <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
              Centralize o acompanhamento de todas as plataformas educacionais do Estado do Paraná em um só lugar. Gerencie tarefas, acompanhe seu progresso e nunca perca um prazo.
            </p>

            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              Começar agora
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
              title: "Para Alunos",
              desc: "Acompanhe suas tarefas em todas as plataformas, visualize seu progresso e nunca perca um prazo.",
              bg: "bg-blue-50",
            },
            {
              icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
              title: "Para Professores",
              desc: "Crie salas de aula, atribua tarefas para toda a turma e acompanhe o progresso de cada aluno.",
              bg: "bg-indigo-50",
            },
            {
              icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
              title: "9 Plataformas",
              desc: "Redação PR, Leia Paraná, Inglês Teens, Khan Academy, Matific, Quizziz e muito mais.",
              bg: "bg-emerald-50",
            },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-5`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plataformas */}
      <div className="container mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Plataformas Integradas</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {PLATFORMS.map((p) => (
            <div key={p.id} className={`flex items-center gap-2 px-4 py-2 rounded-full ${p.lightColor} ${p.textColor} text-sm font-medium border ${p.borderColor}`}>
              <span>{p.emoji}</span>
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard (logado) ───────────────────────────────────────────────────────

function Dashboard() {
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: progressData } = trpc.tasks.progress.useQuery();
  const { data: allTasks = [] } = trpc.tasks.all.useQuery();

  const byPlatform = progressData?.byPlatform ?? {};
  const overall = progressData?.overall ?? 0;

  const getPendingCount = (platformId: string) =>
    allTasks.filter((t) => t.platform === platformId && !t.completed).length;

  const activePlatformData = PLATFORMS.find((p) => p.id === activePlatform);
  const isTeacher = user?.appRole === "professor";

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Banner */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)' }}>
        {/* Banner image overlay */}
        <div className="absolute inset-0">
          <img src={BANNER_URL} alt="Banner" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/5" />
          <div className="absolute top-0 left-1/3 w-px h-full bg-white/10" />
        </div>
        <div className="relative container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">Bem-vindo de volta,</p>
              <h2 className="text-3xl font-bold text-white">{user?.name?.split(" ")[0] ?? "Aluno"} 👋</h2>
              <p className="text-blue-200 text-sm mt-2">
                {isTeacher ? "Painel do Professor" : "Acompanhe seu progresso nas plataformas educacionais"}
              </p>
            </div>

            {/* Progress geral */}
            <div className="flex items-center gap-5 bg-white/10 backdrop-blur rounded-2xl px-6 py-4">
              <div className="relative w-16 h-16">
                <svg width="64" height="64" className="rotate-[-90deg]">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                  <circle
                    cx="32" cy="32" r="26"
                    fill="none"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={2 * Math.PI * 26 - (overall / 100) * 2 * Math.PI * 26}
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{overall}%</span>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-lg leading-tight">Progresso Geral</p>
                <p className="text-blue-200 text-sm">{allTasks.filter(t => t.completed).length} de {allTasks.length} tarefas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de plataformas */}
      <div className="container mx-auto px-6 py-8">
        {isTeacher && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-indigo-900">Você é professor</p>
                <p className="text-sm text-indigo-600">Acesse o painel completo para gerenciar suas turmas</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/professor")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Painel do Professor
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Plataformas Educacionais</h3>
            <p className="text-gray-500 text-sm mt-0.5">Clique em uma plataforma para gerenciar suas tarefas</p>
          </div>
          <button
            onClick={() => navigate("/salas")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Users className="w-4 h-4" />
            {isTeacher ? "Minhas Salas" : "Minhas Turmas"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {PLATFORMS.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              progress={byPlatform[platform.id] ?? 0}
              pendingCount={getPendingCount(platform.id)}
              onClick={() => setActivePlatform(platform.id)}
            />
          ))}
        </div>
      </div>

      {/* Modal de tarefas */}
      {activePlatform && activePlatformData && (
        <TaskModal
          platform={activePlatform}
          platformLabel={activePlatformData.label}
          platformColor={activePlatformData.color}
          onClose={() => setActivePlatform(null)}
        />
      )}
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LandingPage />;
  return <Dashboard />;
}
