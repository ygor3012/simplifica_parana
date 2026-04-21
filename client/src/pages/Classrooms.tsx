import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AppHeader from "@/components/AppHeader";
import { useState } from "react";
import { Plus, Users, Hash, ArrowLeft, BookOpen, Copy, Check } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

// ─── Painel do Aluno ──────────────────────────────────────────────────────────

function StudentClassrooms() {
  const [code, setCode] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const utils = trpc.useUtils();

  const { data: classrooms = [], isLoading } = trpc.classrooms.list.useQuery();

  const joinClassroom = trpc.classrooms.join.useMutation({
    onSuccess: (data) => {
      utils.classrooms.list.invalidate();
      setCode("");
      setShowJoin(false);
      toast.success(`Você entrou na sala "${data.classroom.name}"!`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Minhas Turmas</h2>
          <p className="text-gray-500 text-sm mt-0.5">Turmas em que você está matriculado</p>
        </div>
        <button
          onClick={() => setShowJoin(!showJoin)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Entrar em uma turma
        </button>
      </div>

      {/* Formulário de entrada */}
      {showJoin && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Entrar com código</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Digite o código da turma (ex: ABC123)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinClassroom.mutate({ code })}
              maxLength={8}
              className="flex-1 px-4 py-2.5 rounded-xl border border-blue-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
            />
            <button
              onClick={() => joinClassroom.mutate({ code })}
              disabled={!code.trim() || joinClassroom.isPending}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {joinClassroom.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : "Entrar"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de turmas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">Nenhuma turma ainda</h3>
          <p className="text-gray-400 text-sm">Peça o código ao seu professor e entre em uma turma.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classrooms.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{c.name}</h3>
                  {c.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>}
                  <div className="flex items-center gap-1 mt-2">
                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-mono text-gray-400 tracking-wider">{c.code}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Painel do Professor ──────────────────────────────────────────────────────

function TeacherClassrooms() {
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
      toast.success(`Sala "${data?.name}" criada com sucesso!`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Minhas Salas</h2>
          <p className="text-gray-500 text-sm mt-0.5">Salas de aula que você criou</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Sala
        </button>
      </div>

      {showCreate && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-indigo-900 mb-4">Criar nova sala</h3>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : classrooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">Nenhuma sala criada</h3>
          <p className="text-gray-400 text-sm">Crie sua primeira sala e compartilhe o código com os alunos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classrooms.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{c.name}</h3>
                  {c.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-3 py-1.5">
                      <Hash className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-sm font-mono font-semibold text-gray-700 tracking-widest">{c.code}</span>
                      <CopyButton text={c.code} />
                    </div>
                    <span className="text-xs text-gray-400">Compartilhe com os alunos</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function Classrooms() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const isTeacher = user?.appRole === "professor";

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

        {isTeacher ? <TeacherClassrooms /> : <StudentClassrooms />}
      </div>
    </div>
  );
}
