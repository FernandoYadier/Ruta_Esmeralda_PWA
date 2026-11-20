export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-esmeralda-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
