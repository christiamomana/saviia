export function BookingsFilterForm({
  date,
  name,
  torre,
  torres,
}: {
  date?: string;
  name?: string;
  torre?: string;
  torres: string[];
}) {
  return (
    <form className="flex flex-wrap items-end gap-3" method="get">
      <div>
        <label htmlFor="date" className="text-xs font-medium text-saviia-purple-dark">
          Fecha
        </label>
        <input
          id="date"
          type="date"
          name="date"
          defaultValue={date}
          className="mt-1 block rounded-lg border border-black/10 px-3 py-1.5 text-sm focus:border-saviia-purple focus:outline-none focus:ring-1 focus:ring-saviia-purple"
        />
      </div>
      <div>
        <label htmlFor="name" className="text-xs font-medium text-saviia-purple-dark">
          Residente
        </label>
        <input
          id="name"
          type="text"
          name="name"
          defaultValue={name}
          placeholder="Nombre"
          className="mt-1 block rounded-lg border border-black/10 px-3 py-1.5 text-sm focus:border-saviia-purple focus:outline-none focus:ring-1 focus:ring-saviia-purple"
        />
      </div>
      <div>
        <label htmlFor="torre" className="text-xs font-medium text-saviia-purple-dark">
          Torre
        </label>
        <select
          id="torre"
          name="torre"
          defaultValue={torre ?? ""}
          className="mt-1 block rounded-lg border border-black/10 px-3 py-1.5 text-sm focus:border-saviia-purple focus:outline-none focus:ring-1 focus:ring-saviia-purple"
        >
          <option value="">Todas</option>
          {torres.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-full border border-saviia-purple/30 px-4 py-1.5 text-sm text-saviia-purple-dark hover:bg-saviia-purple/10"
      >
        Filtrar
      </button>
      {(date || name || torre) && (
        <a
          href="?"
          className="rounded-full px-4 py-1.5 text-sm text-foreground/60 hover:bg-black/5"
        >
          Limpiar
        </a>
      )}
    </form>
  );
}
