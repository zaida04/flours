import {model, Schema} from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface IRoom {
    id: string;
    name: string;
    creator: string;
    users: string[];
    closed: boolean;
}

const roomSchema = new Schema<IRoom>({
    id: {type: String, required: true},
    name: {type: String, required: true},
    creator: {type: String, requred: true},
    users: {type: Array, default: []},
    closed: {type: Boolean, default: false},
});

export const Room = model<IRoom>('Room', roomSchema);
