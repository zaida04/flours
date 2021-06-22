import Link from 'next/link';
import Layout from '../components/Layout';
import {IRoom} from '@flours/common';

export default function App({roomsData}: {roomsData: IRoom[]}) {
    return (
        <Layout title="Flours">
            <h1>Welcome to Flours!</h1>
            <p>
                We're not quite sure what's going on either, but hey, we're glad
                to see you.
            </p>
            <br />
            {roomsData.map(room => {
                <Link href={`/join/${room.id}`}>
                    <a>Join room ${room.name}</a>
                </Link>;
            })}
        </Layout>
    );
}

export async function getServerSideProps() {
    const roomsFetch = await fetch(`http://${process.env.API_URL}/rooms`);
    const roomsData: IRoom[] = await roomsFetch.json();

    return {
        props: {roomsData},
    };
}

/*

You will only have to build 3 pages:

2. Join page
    - Simulates the invite page on the real Hours site
    - Allows user to input their name and saves it in `localStorage` as `name`
    - Redirected to from session page if `name` is not in `localStorage`
    - Accessible at a unique URL address
        - `/join/[sessionId]`
    - NOTE: You can also recreate this page with a modal/popup on the session page
3. Session page
    - Simulates the participants display on a regular Hours session
    - Display the names of everyone in the session
    - Trigger and display events when someone leaves and joins
        - Just like a regular Hours session
    - Accessible at a unique URL address
        - `/session/[sessionId]`

*/
