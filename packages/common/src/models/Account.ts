import {model, Schema} from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface IAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  token: string;
  permissions: string[];
}

const accountSchema = new Schema<IAccount>({
  id: {type: String, required: true},
  name: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  token: {type: String, required: false, default: null},
  permissions: {type: Array, default: []},
});

export const Account = model<IAccount>('Account', accountSchema);
