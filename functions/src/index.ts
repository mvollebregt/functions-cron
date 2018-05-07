import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {getPrikbordBerichten} from './prikbord-client';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


admin.initializeApp(functions.config().firebase);


export const hello = functions.pubsub.topic('periodic-tick').onPublish(getPrikbordBerichten);
    // verzendTestbericht();


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

