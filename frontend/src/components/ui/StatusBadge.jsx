export function StatusBadge({ status }) {
  const map = {
    available:        'badge-success',
    active:           'badge-success',
    completed:        'badge-success',
    in_progress:      'badge-info',
    on_trip:          'badge-info',
    assigned:         'badge-gold',
    driver_link_sent: 'badge-gold',
    driver_accepted:  'badge-gold',
    pending:          'badge-warning',
    draft:            'badge-neutral',
    off_duty:         'badge-neutral',
    inactive:         'badge-neutral',
    maintenance:      'badge-warning',
    delayed:          'badge-warning',
    stopped:          'badge-warning',
    cancelled:        'badge-danger',
    prospect:         'badge-warning',
    no_update:        'badge-danger',
  };
  const label = (status || '').replace(/_/g, ' ');
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{label}</span>;
}
