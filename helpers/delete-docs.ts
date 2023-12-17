import { Model, Document } from 'mongoose';

export const deleteDocuments = async <T extends Document>(
  documents: T[],
  model: Model<T>
): Promise<void> => {
  const deletionPromises = documents.map((doc) =>
    model.findByIdAndDelete(doc._id)
  );
  await Promise.all(deletionPromises);
};
