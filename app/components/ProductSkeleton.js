export default function ProductSkeleton() {
  return (
    <div className="col-md-4">
      <div className="skeleton-card">
        <div className="skeleton skeleton-image"></div>

        <div className="p-4">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text short"></div>
          <div className="skeleton skeleton-button"></div>
        </div>
      </div>
    </div>
  );
}