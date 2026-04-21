import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AppHeader from "@/components/AppHeader";
import { useState } from "react";
import { ArrowLeft, User, Mail, Calendar, BarChart3, CheckCircle2, Clock, Award } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [showRoleChange, setShowRoleChange] = useState(false);
  const [newRole, setNewRole] = useState<"aluno" | "professor" | null>(null);

  const { data: allTasks = [] } = trpc.tasks.all.useQuery();
  const { data: progress } = trpc.tasks.progress.useQuery();
  const changeRole = trpc.users.setRole.useMutation({
    onSuccess: () => {
      toast.success("Papel alterado com sucesso! Recarregando...");
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (err) => toast.error(err.message),
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-6 py-16 text-center">
          <p className="text-gray-400">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const completedTasks = allTasks.filter((t) => t.completed).length;
  const pendingTasks = allTasks.filter((t) => !t.completed).length;
  const completionRate = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  const isTeacher = user.appRole === "professor";

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Perfil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Header com gradiente */}
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700" />

              {/* Avatar e info */}
              <div className="px-6 pb-6">
                <div className="flex flex-col items-center -mt-12 mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                    {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 text-center">{user.name ?? "Usuário"}</h2>
                <p className="text-sm text-gray-500 text-center mt-1">{isTeacher ? "Professor" : "Aluno"}</p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">{user.email ?? "—"}</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {/* Botão de trocar papel */}
                <button
                  onClick={() => setShowRoleChange(!showRoleChange)}
                  className="w-full mt-4 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Trocar de Papel
                </button>

                {showRoleChange && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Selecione o novo papel:</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setNewRole("aluno");
                          changeRole.mutate({ appRole: "aluno" });
                        }}
                        disabled={isTeacher === false || changeRole.isPending}
                        className="flex-1 px-3 py-2 rounded-lg bg-white border border-blue-200 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {changeRole.isPending ? "..." : "Aluno"}
                      </button>
                      <button
                        onClick={() => {
                          setNewRole("professor");
                          changeRole.mutate({ appRole: "professor" });
                        }}
                        disabled={isTeacher === true || changeRole.isPending}
                        className="flex-1 px-3 py-2 rounded-lg bg-white border border-blue-200 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {changeRole.isPending ? "..." : "Professor"}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="w-full mt-4 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total de Tarefas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{allTasks.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Concluídas</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{completedTasks}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pendentes</p>
                    <p className="text-3xl font-bold text-amber-600 mt-1">{pendingTasks}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Progresso geral */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Taxa de Conclusão</h3>
                <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {completedTasks} de {allTasks.length} tarefas concluídas
              </p>
            </div>

            {/* Progresso por plataforma */}
            {progress && Object.keys(progress.byPlatform).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Progresso por Plataforma</h3>
                <div className="space-y-3">
                  {Object.entries(progress.byPlatform).map(([platform, percent]) => (
                    <div key={platform}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{platform}</span>
                        <span className="text-sm font-bold text-gray-900">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informações adicionais */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Informações da Conta</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Último acesso</span>
                  <span className="text-sm font-medium text-gray-900">
                    {format(new Date(user.lastSignedIn), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Método de login</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{user.loginMethod ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Papel na plataforma</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{isTeacher ? "Professor" : "Aluno"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
