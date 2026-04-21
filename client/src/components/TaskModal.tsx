import { trpc } from "@/lib/trpc";
import { X, Plus, Trash2, CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskModalProps {
  platform: string;
  platformLabel: string;
  platformColor: string;
  onClose: () => void;
}

export default function TaskModal({ platform, platformLabel, platformColor, onClose }: TaskModalProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const utils = trpc.useUtils();

  const { data: tasks = [], isLoading } = trpc.tasks.list.useQuery({ platform });

  const addTask = trpc.tasks.add.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate({ platform });
      utils.tasks.progress.invalidate();
      utils.tasks.all.invalidate();
      setNewTitle("");
      setNewDate("");
    },
  });

  const toggleTask = trpc.tasks.toggle.useMutation({
    onMutate: async ({ taskId, completed }) => {
      await utils.tasks.list.cancel({ platform });
      const prev = utils.tasks.list.getData({ platform });
      utils.tasks.list.setData({ platform }, (old) =>
        old?.map((t) => (t.id === taskId ? { ...t, completed } : t))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.tasks.list.setData({ platform }, ctx.prev);
    },
    onSettled: () => {
      utils.tasks.list.invalidate({ platform });
      utils.tasks.progress.invalidate();
      utils.tasks.all.invalidate();
    },
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onMutate: async ({ taskId }) => {
      await utils.tasks.list.cancel({ platform });
      const prev = utils.tasks.list.getData({ platform });
      utils.tasks.list.setData({ platform }, (old) => old?.filter((t) => t.id !== taskId));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.tasks.list.setData({ platform }, ctx.prev);
    },
    onSettled: () => {
      utils.tasks.list.invalidate({ platform });
      utils.tasks.progress.invalidate();
      utils.tasks.all.invalidate();
    },
  });

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTask.mutate({ platform, title: newTitle.trim(), dueDate: newDate || undefined });
  };

  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`${platformColor} px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{platformLabel}</h2>
              <p className="text-white/70 text-sm mt-0.5">
                {pending.length} pendente{pending.length !== 1 ? "s" : ""} · {done.length} concluída{done.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Adicionar tarefa */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Nova Tarefa</p>
            <input
              type="text"
              placeholder="Título da tarefa..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
            />
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim() || addTask.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista de tarefas */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">Nenhuma tarefa ainda.</p>
              <p className="text-gray-300 text-xs mt-1">Adicione sua primeira tarefa acima.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Pendentes */}
              {pending.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Pendentes</p>
                  {pending.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 group transition-colors"
                    >
                      <button
                        onClick={() => toggleTask.mutate({ taskId: task.id, completed: true })}
                        className="mt-0.5 text-gray-300 hover:text-blue-600 transition-colors flex-shrink-0"
                      >
                        <Circle className="w-5 h-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
                        {task.dueDate && (
                          <p className={`text-xs mt-0.5 flex items-center gap-1 ${isOverdue(task.dueDate) ? "text-red-500" : "text-gray-400"}`}>
                            {isOverdue(task.dueDate) ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {format(new Date(task.dueDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteTask.mutate({ taskId: task.id })}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Concluídas */}
              {done.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Concluídas</p>
                  {done.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 group transition-colors opacity-60"
                    >
                      <button
                        onClick={() => toggleTask.mutate({ taskId: task.id, completed: false })}
                        className="mt-0.5 text-green-500 hover:text-gray-400 transition-colors flex-shrink-0"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 line-through leading-snug">{task.title}</p>
                      </div>
                      <button
                        onClick={() => deleteTask.mutate({ taskId: task.id })}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
