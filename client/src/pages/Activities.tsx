import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AppHeader from "@/components/AppHeader";
import { ArrowLeft, CheckCircle2, Circle, Clock, AlertCircle, Filter } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PLATFORM_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  Redacao: { label: "Redação Paraná", emoji: "✍️", color: "bg-rose-100 text-rose-700" },
  Leia: { label: "Leia Paraná", emoji: "📚", color: "bg-emerald-100 text-emerald-700" },
  Teens: { label: "Inglês Teens", emoji: "🌍", color: "bg-sky-100 text-sky-700" },
  High: { label: "Inglês High", emoji: "🎓", color: "bg-violet-100 text-violet-700" },
  Desafio: { label: "Desafio PR", emoji: "🏆", color: "bg-amber-100 text-amber-700" },
  Khan: { label: "Khan Academy", emoji: "🔬", color: "bg-green-100 text-green-700" },
  Matific: { label: "Matific", emoji: "🔢", color: "bg-blue-100 text-blue-700" },
  Class: { label: "Google Classroom", emoji: "🖥️", color: "bg-cyan-100 text-cyan-700" },
  Quizziz: { label: "Quizziz", emoji: "❓", color: "bg-fuchsia-100 text-fuchsia-700" },
};

export default function Activities() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<"todas" | "pendentes" | "concluidas">("todas");
  const [platformFilter, setPlatformFilter] = useState<string>("todas");
  const utils = trpc.useUtils();

  const { data: allTasks = [], isLoading } = trpc.tasks.all.useQuery();

  const toggleTask = trpc.tasks.toggle.useMutation({
    onMutate: async ({ taskId, completed }) => {
      await utils.tasks.all.cancel();
      const prev = utils.tasks.all.getData();
      utils.tasks.all.setData(undefined, (old) =>
        old?.map((t) => (t.id === taskId ? { ...t, completed } : t))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.tasks.all.setData(undefined, ctx.prev);
    },
    onSettled: () => {
      utils.tasks.all.invalidate();
      utils.tasks.progress.invalidate();
    },
  });

  const filtered = allTasks.filter((t) => {
    const statusOk =
      filter === "todas" ||
      (filter === "pendentes" && !t.completed) ||
      (filter === "concluidas" && t.completed);
    const platformOk = platformFilter === "todas" || t.platform === platformFilter;
    return statusOk && platformOk;
  });

  const pendingCount = allTasks.filter((t) => !t.completed).length;
  const doneCount = allTasks.filter((t) => t.completed).length;

  const isOverdue = (dueDate: Date | null) => dueDate && new Date(dueDate) < new Date();

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

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Todas as Atividades</h1>
            <p className="text-gray-500 text-sm mt-0.5">{pendingCount} pendente{pendingCount !== 1 ? "s" : ""} · {doneCount} concluída{doneCount !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1">
            {(["todas", "pendentes", "concluidas"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === f ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "todas" ? "Todas" : f === "pendentes" ? "Pendentes" : "Concluídas"}
              </button>
            ))}
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Todas as plataformas</option>
            {Object.entries(PLATFORM_MAP).map(([id, p]) => (
              <option key={id} value={id}>{p.emoji} {p.label}</option>
            ))}
          </select>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma atividade encontrada.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            {filtered.map((task, i) => {
              const platform = PLATFORM_MAP[task.platform];
              const overdue = isOverdue(task.dueDate);
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    i < filtered.length - 1 ? "border-b border-gray-50" : ""
                  } hover:bg-gray-50 transition-colors group`}
                >
                  <button
                    onClick={() => toggleTask.mutate({ taskId: task.id, completed: !task.completed })}
                    className={`flex-shrink-0 transition-colors ${
                      task.completed ? "text-green-500 hover:text-gray-300" : "text-gray-300 hover:text-blue-600"
                    }`}
                  >
                    {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {task.title}
                    </p>
                    {task.dueDate && !task.completed && (
                      <p className={`text-xs mt-0.5 flex items-center gap-1 ${overdue ? "text-red-500" : "text-gray-400"}`}>
                        {overdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {format(new Date(task.dueDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        {overdue && " — Atrasada"}
                      </p>
                    )}
                  </div>

                  {platform && (
                    <span className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${platform.color}`}>
                      <span>{platform.emoji}</span>
                      <span className="hidden sm:inline">{platform.label}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
