export const validateDate = (dateStr: string) => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  return regex.test(dateStr);
};
