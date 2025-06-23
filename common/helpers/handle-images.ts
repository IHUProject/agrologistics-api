export const normalizeFilesInput = (
  files:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined
): Express.Multer.File[] => {
  let fileArray: Express.Multer.File[] = [];

  if (Array.isArray(files)) {
    fileArray = files;
  } else if (typeof files === 'object' && files !== null) {
    fileArray = Object.values(files).flat();
  }

  return fileArray;
};
