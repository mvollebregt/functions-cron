import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import TokenMessage = require('firebase-admin');

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


admin.initializeApp(functions.config().firebase);


export const hello = functions.pubsub.topic('periodic-tick').onPublish(() => {
    verzendTestbericht();
});


function verzendTestbericht() {

    const message = {
        notification: {
            title: 'Title',
            body: 'Body'
        },
        topic: 'loopgroep'
    };

    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}