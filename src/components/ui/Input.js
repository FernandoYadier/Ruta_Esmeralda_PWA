// "name" se usa también como id para enlazar la etiqueta con el campo.
export default function Input({ label, name, error, className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-esmeralda-900">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        className={`rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-1 focus:outline-esmeralda-600 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
