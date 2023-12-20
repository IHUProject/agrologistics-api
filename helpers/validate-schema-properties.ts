export const validateDate = (date: string) => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  return regex.test(date);
};

export const validatePhoneNumber = (value: number | string): boolean => {
  if (!value) {
    return true;
  }
  return /^[0-9]{10}$/.test(
    typeof value === 'number' ? value.toString() : value
  );
};

export const validateLatitude = (value: number): boolean =>
  !isNaN(value) && value >= -90 && value <= 90;

export const validateLongitude = (value: number): boolean =>
  !isNaN(value) && value >= -180 && value <= 180;

export const validateAFM = (value: number) =>
  /^[0-9]{9}$/.test(value.toString());
