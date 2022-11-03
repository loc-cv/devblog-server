import { Types } from 'mongoose';

export const isValidObjectId = (id: string) => {
  const { ObjectId } = Types;
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return true;
  }
  return false;
};
