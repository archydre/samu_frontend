function Header({ loading }: { loading: boolean }) {
  return (
    // No container principal:
    // - Em mobile (sem prefixo): flex-col (empilha verticalmente)
    // - Em telas médias/grandes (md:): flex-row (volta a alinhar horizontalmente)
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
      {/* 1. Título e Loading: Alinhe à esquerda em ambas as telas */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Visualização SAMU
        </h1>
        {loading && (
          <span className="text-blue-600 text-sm animate-pulse">
            Atualizando rota...
          </span>
        )}
      </div>

      {/* 2. Lista de Nomes: 
          - Em mobile: Quebra de linha horizontal (flex-wrap) e fonte bem pequena (text-xs)
          - Em desktop: Permanece alinhado.
      */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2 md:mt-0">
        <p className="font-semibold">Equipe:</p>{" "}
        {/* Adicionado um label para clareza */}
        <p>Zaqueu Nilton de Souza Paiva</p>
        <p>Francisco Genyson Alves Bezerra</p>
        <p>Arthut Nathan De Oliveira Leite</p>
        <p>Ruan Varsew Fonseca Fernandes</p>
      </div>
    </div>
  );
}

export default Header;
