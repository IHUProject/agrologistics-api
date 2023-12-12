export const validateDate = (date: Date): boolean => {
  if (!(date instanceof Date)) {
    return false;
  }

  const dateString = date.toLocaleDateString('en-GB'); // 'en-GB' format is DD/MM/YYYY

  // Regular expression to check the DD/MM/YYYY format
  const regex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(dateString);
};

export const validatePhoneNumber = (value: number): boolean =>
  /^[0-9]{10}$/.test(value.toString());

export const validateLatitude = (value: number): boolean =>
  !isNaN(value) && value >= -90 && value <= 90;

export const validateLongitude = (value: number): boolean =>
  !isNaN(value) && value >= -180 && value <= 180;

export const validateAFM = (value: number) =>
  /^[0-9]{9}$/.test(value.toString());
