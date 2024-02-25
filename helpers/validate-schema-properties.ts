export const validateDate = (date: Date) =>
  date instanceof Date && !isNaN(date.getTime());

export const validatePhoneNumber = (value: number | string) => {
  if (!value) {
    return true;
  }
  return /^[0-9]{10}$/.test(
    typeof value === 'number' ? value.toString() : value
  );
};

export const validateLatitude = (value: number) =>
  !isNaN(value) && value >= -90 && value <= 90;

export const validateLongitude = (value: number) =>
  !isNaN(value) && value >= -180 && value <= 180;

export const validateAFM = (value: number) =>
  /^[0-9]{9}$/.test(value.toString());

export const validateGmail = (email: string): boolean =>
  /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
