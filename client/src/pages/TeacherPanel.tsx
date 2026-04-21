import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AppHeader from "@/components/AppHeader";
import { useState } from "react";
import {
  ArrowLeft, Users, BookOpen, BarChart2, Plus, Hash,
  GraduationCap, TrendingUp, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PLATFORMS = [
  { id: "Redacao", label: "Redação Paraná", emoji: "✍️" },
  { id: "Leia", label: "Leia Paraná", emoji: "📚" },
  { id: "Teens", label: "Inglês Teens", emoji: "🌍" },
  { id: "High", label: "Inglês High", emoji: "🎓" },
  { id: "Desafio", label: "Desafio PR", emoji: "🏆" },
  { id: "Khan", label: "Khan Academy", emoji: "🔬" },
  { id: "Matific", label: "Matific", emoji: "🔢" },
  { id: "Class", label: "Google Classroom", emoji: "🖥️" },
  { id: "Quizziz", label: "Quizziz", emoji: "❓" },
];

function ProgressBar({ value, color = "bg-blue-600" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color} transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

interface ClassroomDetailProps {
  classroomId: number;
  classroomName: string;
  onBack: () => void;
}

function ClassroomDetail({ classroomId, classroomName, onBack }: ClassroomDetailProps) {
  const [activeTab, setActiveTab] = useState<"alunos" | "tarefas" | "progresso">("alunos");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPlatform, setTaskPlatform] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const utils = trpc.useUtils();

  const { data: students = [], isLoading: loadingStudents } = trpc.classrooms.getStudents.useQuery({ classroomId });
  const { data: progress, isLoading: loadingProgress } = trpc.classrooms.classProgress.useQuery({ classroomId });

  const assignTask = trpc.tasks.assignToClass.useMutation({
    onSuccess: (data) => {
      utils.classrooms.classProgress.invalidate({ classroomId });
      setTaskTitle("");
      setTaskPlatform("");
      setTaskDate("");
      toast.success(`Tarefa atribuída a ${data.count} aluno${data.count !== 1 ? "s" : ""}!`);
    },
    onError: (err) => toast.error(err.message),
  });

  const tabs = [
    { id: "alunos" as const, label: "Alunos", icon: <Users className="w-4 h-4" />, count: students.length },
    { id: "tarefas" as const, label: "Atribuir Tarefa", icon: <Plus className="w-4 h-4" /> },
    { id: "progresso" as const, label: "Progresso", icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar às salas
      </button>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Header da sala */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{classroomName}</h2>
              <p className="text-indigo-200 text-sm mt-0.5">{students.length} aluno{students.length !== 1 ? "s" : ""} matriculado{students.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {progress && (
            <div className="mt-4 bg-white/10 rounded-2xl px-5 py-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/80 text-sm">Progresso da turma</span>
                  <span className="text-white font-bold">{progress.overall}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-white transition-all duration-500"
                    style={{ width: `${progress.overall}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* Alunos */}
          {activeTab === "alunos" && (
            <div>
              {loadingStudents ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-10">
                  <GraduationCap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Nenhum aluno ainda.</p>
                  <p className="text-gray-300 text-xs mt-1">Compartilhe o código da sala com seus alunos.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {s.name?.charAt(0)?.toUpperCase() ?? "A"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{s.name ?? "Aluno"}</p>
                        <p className="text-xs text-gray-400 truncate">{s.email ?? ""}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Aluno
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Atribuir tarefa */}
          {activeTab === "tarefas" && (
            <div className="max-w-lg">
              <p className="text-sm text-gray-500 mb-4">
                A tarefa será atribuída automaticamente para todos os {students.length} aluno{students.length !== 1 ? "s" : ""} da sala.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Plataforma</label>
                  <select
                    value={taskPlatform}
                    onChange={(e) => setTaskPlatform(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                  >
                    <option value="">Selecione a plataforma...</option>
                    {PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Título da Tarefa</label>
                  <input
                    type="text"
                    placeholder="Ex: Completar módulo 3 de frações"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Prazo (opcional)</label>
                  <input
                    type="datetime-local"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={() => assignTask.mutate({ classroomId, platform: taskPlatform, title: taskTitle, dueDate: taskDate || undefined })}
                  disabled={!taskTitle.trim() || !taskPlatform || students.length === 0 || assignTask.isPending}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {assignTask.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Atribuir para {students.length} aluno{students.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Progresso */}
          {activeTab === "progresso" && (
            <div>
              {loadingProgress ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              ) : !progress || progress.students.length === 0 ? (
                <div className="text-center py-10">
                  <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Nenhum dado de progresso ainda.</p>
                  <p className="text-gray-300 text-xs mt-1">Atribua tarefas para acompanhar o progresso.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {progress.students.map(({ student, total, done, percent }) => (
                    <div key={student.id} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {student.name?.charAt(0)?.toUpperCase() ?? "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{student.name ?? "Aluno"}</p>
                          <p className="text-xs text-gray-400">{done} de {total} tarefas concluídas</p>
                        </div>
                        <span className={`text-sm font-bold ${percent >= 80 ? "text-green-600" : percent >= 50 ? "text-amber-600" : "text-red-500"}`}>
                          {percent}%
                        </span>
                      </div>
                      <ProgressBar
                        value={percent}
                        color={percent >= 80 ? "bg-green-500" : percent >= 50 ? "bg-amber-500" : "bg-red-500"}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function TeacherPanel() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedClassroom, setSelectedClassroom] = useState<{ id: number; name: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const utils = trpc.useUtils();

  const { data: classrooms = [], isLoading } = trpc.classrooms.list.useQuery();

  const createClassroom = trpc.classrooms.create.useMutation({
    onSuccess: (data) => {
      utils.classrooms.list.invalidate();
      setName("");
      setDescription("");
      setShowCreate(false);
      toast.success(`Sala "${data?.name}" criada!`);
    },
    onError: (err) => toast.error(err.message),
  });

  if (user?.appRole !== "professor") {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-6 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Acesso restrito</h2>
          <p className="text-gray-400 mt-2">Esta área é exclusiva para professores.</p>
        </div>
      </div>
    );
  }

  if (selectedClassroom) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-6 py-8">
          <ClassroomDetail
            classroomId={selectedClassroom.id}
            classroomName={selectedClassroom.name}
            onBack={() => setSelectedClassroom(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel do Professor</h1>
            <p className="text-gray-500 text-sm mt-0.5">Gerencie suas salas, alunos e tarefas</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Sala
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Salas Criadas", value: classrooms.length, icon: <BookOpen className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50" },
            { label: "Plataformas", value: 9, icon: <BarChart2 className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
            { label: "Perfil", value: "Professor", icon: <GraduationCap className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Criar sala */}
        {showCreate && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-indigo-900 mb-4">Nova Sala de Aula</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome da sala (ex: 9º Ano A — Matemática)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => createClassroom.mutate({ name, description })}
                  disabled={!name.trim() || createClassroom.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {createClassroom.isPending ? "Criando..." : "Criar Sala"}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-5 py-2.5 rounded-xl border border-indigo-200 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de salas */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Nenhuma sala criada</h3>
            <p className="text-gray-400 text-sm">Crie sua primeira sala e compartilhe o código com os alunos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClassroom({ id: c.id, name: c.name })}
                className="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{c.name}</h3>
                    {c.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5">
                    <Hash className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-sm font-mono font-semibold text-gray-700 tracking-widest">{c.code}</span>
                  </div>
                  <span className="text-xs text-indigo-600 font-medium group-hover:underline">Ver detalhes →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
