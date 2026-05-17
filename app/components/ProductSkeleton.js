export default function ProductSkeleton({ columnClassName = "col-md-4" }) {
  return (
    <div className={columnClassName}>
      <div className="skeleton-card">
        <div className="skeleton skeleton-image"></div>

        <div className="p-4">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-button"></div>
        </div>
      </div>
    </div>
  );
}
