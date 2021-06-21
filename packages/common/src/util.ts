import {connect} from 'mongoose';

export async function connectToDB({
  username,
  password,
  host,
  db,
}: {
  username: string;
  password: string;
  host: string;
  db: string;
}) {
  return connect(`mongodb://${username}:${password}@${host}/${db}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
