import { useState, useEffect } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import * as db from "../../lib/db";
import type { Box } from "../../types";

export function LoginScreen() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [boxId, setBoxId] = useState("");
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "signup") {
      void db.fetchAllBoxes().then(setBoxes).catch(console.error);
    }
  }, [mode]);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        await signUp(
          email.trim(),
          password,
          fullName.trim() || "Atleta",
          boxId || undefined,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de autenticação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">GymTracker</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestão de treinos, aulas e presenças do teu box.
          </p>
        </div>

        <div className="px-6 py-5 space-y-3">
          {mode === "signup" && (
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nome completo"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
          />
          {mode === "signup" && boxes.length > 0 && (
            <select
              value={boxId}
              onChange={(e) => setBoxId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            >
              <option value="">Selecionar box...</option>
              {boxes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!email || !password || loading}
            className="w-full rounded-xl bg-gray-900 text-white py-2.5 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mode === "signin" ? <LogIn size={16} /> : <UserPlus size={16} />}
            {loading
              ? "A processar..."
              : mode === "signin"
                ? "Entrar"
                : "Criar conta"}
          </button>

          <button
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
            className="w-full text-xs text-gray-500 hover:text-gray-800"
          >
            {mode === "signin"
              ? "Ainda não tens conta? Criar conta"
              : "Já tens conta? Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
