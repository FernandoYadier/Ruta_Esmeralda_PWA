import { Star } from "lucide-react";

// Cinco estrellas; se rellenan según la calificación (redondeada al entero más cercano).
export default function Estrellas({ valor = 0, size = 16, className = "" }) {
  const llenas = Math.round(valor);
  return (
    <span role="img" aria-label={`${valor} de 5 estrellas`} className={`inline-flex gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          aria-hidden="true"
          className={n <= llenas ? "fill-amber-400 text-amber-400" : "text-gray-300"}
        />
      ))}
    </span>
  );
}
