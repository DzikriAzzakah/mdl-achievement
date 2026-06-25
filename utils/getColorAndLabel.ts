export function getColorAccessibility(type?: string) {
  switch (type) {
    case 'UNASSIGNED':
    case 'unassigned':
      return 'ghost';
    case 'RESTRICTED':
    case 'selected':
      return 'info';
    default:
      return 'success'; // PUBLIC
  }
}

export function getTypeLabel(type?: string) {
  switch (type) {
    case 'publish':
      return 'Published';
    case 'draft':
      return 'Not Published';
    case 'UNASSIGNED':
    case 'unassigned':
      return 'Unassigned';
    case 'RESTRICTED':
      return 'Selected';
    case 'PUBLIC':
      return 'All Users';
    case 'all_user':
      return 'All Users';
    case 'selected':
      return 'Selected';
    default:
      return '-';
  }
}
