import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {getPrikbordBerichten} from './prikbord-client';
import {Bericht} from './bericht';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

export const hello = functions.pubsub.topic('periodic-tick').onPublish(synchroniseerBerichten);


async function synchroniseerBerichten() {
    const berichten = await getPrikbordBerichten();
    const laatstVerwerkteRef = db.collection('prikbord').doc('latest');
    const laatstVerwerkte = await laatstVerwerkteRef.get();

    if (laatstVerwerkte.exists) {
        let aantalNieuwe = berichten.findIndex(bericht => equal(bericht, laatstVerwerkte.data() as Bericht));
        aantalNieuwe = aantalNieuwe != -1 ? aantalNieuwe : berichten.length;
        for (let i = aantalNieuwe - 1; i >=0; i--) {
            await verzendNotificatie(berichten[i].auteur, berichten[i].berichttekst.join('\n'));
        }
    }
    laatstVerwerkteRef.set(berichten[0]);
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


async function verzendNotificatie(title: string, body: string) {
    const message = {
        notification: {title, body},
        topic: 'loopgroep'
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
