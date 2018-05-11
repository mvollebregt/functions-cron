import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {getPrikbordBerichten} from './prikbord-client';
import {Bericht} from './bericht';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

export const periodicSync = functions.pubsub.topic('periodic-tick').onPublish(synchroniseerBerichten);
export const callableSync = functions.https.onCall(synchroniseerBerichten);
export const callableTest = functions.https.onCall(() => verzendNotificatie('algemeen', 'Testbericht', 'Dit is een eenmalig testbericht.'));

const MILLIS_ONE_DAY = 1000 * 60 * 60 * 24;

async function synchroniseerBerichten() {
    const berichten = await getPrikbordBerichten();
    const laatstVerwerkteRef = db.collection('prikbord').doc('latest');
    const laatstVerwerkte = await laatstVerwerkteRef.get();

    if (laatstVerwerkte.exists) {
        let aantalNieuwe = berichten.findIndex(bericht => equal(bericht, laatstVerwerkte.data() as Bericht));
        aantalNieuwe = aantalNieuwe != -1 ? aantalNieuwe : berichten.length;
        console.log(`${aantalNieuwe} nieuwe berichten`);
        for (let i = aantalNieuwe - 1; i >=0; i--) {
            await verzendNotificatie('prikbord', berichten[i].auteur, berichten[i].berichttekst.join('\n'));
        }
    } else {
        console.log('berichten nog niet eerder gecheckt');
    }
    laatstVerwerkteRef.set(berichten[0]);

    await stuurDagelijksTestbericht();
}

async function stuurDagelijksTestbericht() {
    const now = Date.now();
    const laatsteTestBerichtRef = db.collection('test').doc('latest');
    const laatsteTestBericht = await laatsteTestBerichtRef.get();

    if (!laatsteTestBericht.exists || (now - laatsteTestBericht.data().timestamp > MILLIS_ONE_DAY)) {
        console.log('dagelijks testbericht versturen');
        await verzendNotificatie('algemeen', 'Testbericht', 'Dit is het dagelijkste testbericht.');
        laatsteTestBerichtRef.set({timestamp: now});
    }
}


function equal(links: Bericht, rechts: Bericht) {
    if (differNull(links, rechts)
        || links.auteur !== rechts.auteur
        || links.tijdstip !== rechts.tijdstip
        || differNull(links.berichttekst, rechts.berichttekst)
        || links.berichttekst.length !== rechts.berichttekst.length) {
        return false;
    } else {
        for (let i = 0; i < links.berichttekst.length; i++) {
            if (links.berichttekst[i] !== rechts.berichttekst[i]) {
                return false;
            }
        }
    }
    return true;
}

function differNull(links: any, rechts: any) {
    return (links === null || rechts === null) && links !== rechts;
}


async function verzendNotificatie(topic: string, title: string, body: string) {
    const message = {
        notification: {title, body},
        topic
    };
    return await admin.messaging().send(message);
}


// export const onreq = functions.https.onRequest((req, res) => {
//     getPrikbordBerichten()
//         .then(() => console.log('prikbord gecheckt'))
//         .catch((err) => console.error(err));
// });

//
// function verzendTestbericht() {
//
//     const message = {
//         notification: {
//             title: 'Title',
//             body: 'Body'
//         },
//         topic: 'loopgroep'
//     };
//
//     admin.messaging().send(message)
//         .then((response) => {
//             // Response is a message ID string.
//             console.log('Successfully sent message:', response);
//         })
//         .catch((error) => {
//             console.log('Error sending message:', error);
//         });
//
//     // silent message
//     // admin.messaging().sendToTopic(
//     //     'loopgroep',;;;;;;;;7i8
//     //     {data: {key: 'value'}},
//     //     {contentAvailable: true}
//     // ).then(() => { console.log('handled!')})
//     //     .catch(() => console.log('handled!'));
// }
