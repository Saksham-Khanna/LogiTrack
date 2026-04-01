export default function StatusBadge({ status }) {
  const styles = {
    'Pending': 'bg-warning/15 text-warning border border-warning/20',
    'Accepted': 'bg-success/15 text-success border border-success/20',
    'On The Way': 'bg-info/15 text-info border border-info/20',
    'In Transit': 'bg-info/15 text-info border border-info/20',
    'Delivered': 'bg-accent/15 text-accent border border-accent/20',
    'Cancelled': 'bg-danger/15 text-danger border border-danger/20',
  };

  return (
    <span className={`status-badge ${styles[status] || styles['Pending']}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
      {status}
    </span>
  );
}
