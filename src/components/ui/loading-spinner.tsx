export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`}>
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
      <style jsx>{`
        .animate-spin {
          border-color: var(--devon-orange);
          border-right-color: var(--devon-blue);
        }
      `}</style>
    </div>
  );
}