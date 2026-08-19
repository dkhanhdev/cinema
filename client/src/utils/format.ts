export const formatVND = (amount: number = 0): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDateVN = (dateString: string | Date): string => {
  const d = new Date(dateString);
  return d.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatTimeVN = (dateString: string | Date): string => {
  const d = new Date(dateString);
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
