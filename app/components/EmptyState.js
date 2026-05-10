export default function EmptyState({
  title,
  message,
  actionText,
  actionHref,
}) {
  return (
    <div className="empty-state text-center">
      <div className="empty-state-icon">✨</div>

      <h4 className="fw-bold mb-2">{title}</h4>

      <p className="text-muted mb-4">{message}</p>

      {actionText && actionHref && (
        <a href={actionHref} className="btn btn-dark">
          {actionText}
        </a>
      )}
    </div>
  );
}