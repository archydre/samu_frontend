import React from "react";

const TEAM_MEMBERS = [
  "Zaqueu N. S. Paiva",
  "Francisco G. A. Bezerra",
  "Arthur N. O. Leite",
  "Ruan V. F. Fernandes",
];

interface HeaderProps {
  loading: boolean;
  executionTime?: number;
  onRandomize: () => void; // Nova prop
}

export default function Header({
  loading,
  executionTime,
  onRandomize,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 font-sans shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-y-3 px-4 py-3 md:h-16 md:flex-row md:items-center md:justify-between md:gap-y-0 md:px-6 md:py-0">
        {/* --- LINHA SUPERIOR (Mobile) / ESQUERDA (Desktop) --- */}
        <div className="flex w-full items-center justify-between md:w-auto">
          {/* Logo e Título */}
          <div className="flex min-w-0 items-center gap-2 md:gap-3 select-none">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 truncate">
                SAMU
              </span>
              <h1 className="text-sm font-bold text-gray-900 truncate">
                Visualização
              </h1>
            </div>
          </div>

          {/* AÇÕES MOBILE (Botão + Status) */}
          <div className="flex items-center gap-2 md:hidden shrink-0 ml-2">
            <RandomizeButton onClick={onRandomize} loading={loading} mobile />
            <StatusBadge loading={loading} executionTime={executionTime} />
          </div>
        </div>

        {/* --- CENTRO (Desktop) / INFERIOR (Mobile) --- */}
        <div className="w-full min-w-0 overflow-hidden md:flex md:flex-1 md:justify-center md:px-4">
          <div className="no-scrollbar flex items-center overflow-x-auto scroll-smooth py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:py-0">
            <div className="flex items-center gap-4 whitespace-nowrap pr-4 md:gap-1.5 md:rounded-full md:bg-gray-100/50 md:px-4 md:py-1.5 md:pr-4">
              <span className="shrink-0 text-[10px] font-bold uppercase text-gray-400 md:mr-1">
                Dev Team
              </span>
              <div className="h-3 w-px shrink-0 bg-gray-200 md:hidden"></div>
              {TEAM_MEMBERS.map((member, i) => (
                <React.Fragment key={member}>
                  <span className="cursor-default text-xs font-medium text-gray-600 transition-colors hover:text-blue-600">
                    {member}
                  </span>
                  {i < TEAM_MEMBERS.length - 1 && (
                    <span className="hidden text-[10px] text-gray-300 md:inline-block md:mx-1">
                      ●
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* --- DIREITA (Desktop apenas) --- */}
        <div className="hidden shrink-0 md:flex md:w-auto md:items-center md:justify-end md:gap-3">
          <RandomizeButton onClick={onRandomize} loading={loading} />
          <div className="h-4 w-px bg-gray-200"></div>
          <StatusBadge loading={loading} executionTime={executionTime} />
        </div>
      </div>
    </header>
  );
}

// Botão de Sortear (Responsivo)
function RandomizeButton({
  onClick,
  loading,
  mobile,
}: {
  onClick: () => void;
  loading: boolean;
  mobile?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        flex items-center justify-center rounded-lg font-medium transition-all active:scale-95
        ${
          loading
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-blue-50 text-blue-600 hover:text-blue-700"
        }
        ${
          mobile
            ? "h-8 w-8 bg-gray-50 border border-gray-200" // Mobile: Quadrado, ícone apenas
            : "px-3 py-1.5 text-xs bg-white border border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-blue-600/10" // Desktop: Botão completo
        }
      `}
      title="Sortear novo vértice"
    >
      <svg
        className={`shrink-0 ${mobile ? "h-4 w-4" : "h-3.5 w-3.5 mr-2"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {!mobile && <span>Sortear Vértice</span>}
    </button>
  );
}

function StatusBadge({
  loading,
  executionTime,
}: {
  loading: boolean;
  executionTime?: number;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 whitespace-nowrap">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
        </span>
        <span>Processando</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200 transition-all hover:bg-gray-100 whitespace-nowrap">
      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"></span>
      {executionTime !== undefined ? (
        <span className="font-mono tabular-nums">
          {executionTime.toFixed(2)}ms
        </span>
      ) : (
        <span>Pronto</span>
      )}
    </div>
  );
}
