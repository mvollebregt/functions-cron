import * as WebRequest from 'web-request';
import { JSDOM } from 'jsdom';

export async function checkPrikbord() {
    const result = await WebRequest.get('http://www.loopgroepgroningen.nl/index.php/prikbord');
    const doc = new JSDOM(result.content).window.document;
    const elements = doc.querySelectorAll('div.easy_frame');
    const objects = [];
    for (let i = 0; i < elements.length; i++) {
        objects.push(mapToObject(elements.item(i)))
    }
    return objects;
}

function mapToObject(node) {
    const auteur = node.querySelector('.easy_big').textContent.trim();
    const tijdstip = node.querySelector('.easy_small').textContent.trim(); //moment
    const content = node.querySelector('.easy_content');
    return {
        auteur: auteur,
        tijdstip: tijdstip, // format
        berichttekst: toParagraaf(content)
    }
}

export function toParagraaf(element): string[]{
    if (!element) {
        return [];
    } else {
        const childNodes = element.childNodes;
        const paragraaf: string[] = [];
        let lineBreaks = 0;
        for (let i = 0; i < childNodes.length; i++) {
            const textContent = childNodes[i].textContent.trim();
            if (textContent.length) {
                if (lineBreaks > 1 && paragraaf.length) {
                    paragraaf.push('');
                }
                paragraaf.push(textContent);
                lineBreaks = 0;
            } else {
                lineBreaks++;
            }
        }
        return paragraaf;
    }
}
