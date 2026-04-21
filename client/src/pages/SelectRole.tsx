import { trpc } from "@/lib/trpc";
import { GraduationCap, BookOpen, ArrowRight } from "lucide-react";

import { useState } from "react";
import { useLocation } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663581549450/miB6HanbY7uDLSpWUY8oNy/logo-simplifica-nsCmT7SsdtGqLsvCacBHPy.webp";

export default function SelectRole() {
  const [selected, setSelected] = useState<"aluno" | "professor" | null>(null);
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const setRole = trpc.users.setRole.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/");
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">Simplifica</h1>
              <p className="text-sm font-medium text-blue-600 -mt-1">Paraná</p>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Como você vai usar a plataforma?</h2>
          <p className="text-gray-500 text-sm mt-1">Escolha seu perfil para personalizar sua experiência</p>
        </div>

        {/* Cards de seleção */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setSelected("aluno")}
            className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
              selected === "aluno"
                ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100"
                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
            }`}
          >
            {selected === "aluno" && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              selected === "aluno" ? "bg-blue-600" : "bg-blue-100 group-hover:bg-blue-200"
            }`}>
              <GraduationCap className={`w-6 h-6 ${selected === "aluno" ? "text-white" : "text-blue-600"}`} />
            </div>
            <h3 className="font-semibold text-gray-900 text-base">Aluno</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Acompanhe suas atividades e progresso nas plataformas</p>
          </button>

          <button
            onClick={() => setSelected("professor")}
            className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
              selected === "professor"
                ? "border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100"
                : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
            }`}
          >
            {selected === "professor" && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              selected === "professor" ? "bg-indigo-600" : "bg-indigo-100 group-hover:bg-indigo-200"
            }`}>
              <BookOpen className={`w-6 h-6 ${selected === "professor" ? "text-white" : "text-indigo-600"}`} />
            </div>
            <h3 className="font-semibold text-gray-900 text-base">Professor</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Crie salas, atribua tarefas e acompanhe a turma</p>
          </button>
        </div>

        <button
          disabled={!selected || setRole.isPending}
          onClick={() => selected && setRole.mutate({ appRole: selected })}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          {setRole.isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Continuar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
