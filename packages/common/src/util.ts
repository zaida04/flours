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
  console.log(`mongodb://${username}:${encodeURI(password)}@${host}/${db}`);

  return connect(`mongodb://${username}:${encodeURI(password)}@${host}/${db}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
