import * as WebRequest from 'web-request';
import { JSDOM, Element } from 'jsdom';

const baseUrl = 'http://www.loopgroepgroningen.nl/';

/**
 * Haalt de informatie van de relatieve URL op, past er de CSS selector op toe, en mapt ieder resultaat naar een object
 * met behulp van de mapper.
 */
export async function extract<T>(relativeUrl: string, selector: string, mapper: (elt: Element) => T) {
    const response = await WebRequest.get(baseUrl + relativeUrl);
    const doc = new JSDOM(response.content).window.document;
    const elements = doc.querySelectorAll(selector);
    const result = []
    for (let i = 0; i < elements.length; i++) {
        result.push(mapper(elements.item(i)));
    }
    return result;
}

/**
 * Haalt de tekst uit een element en vertaalt dit naar een lijst van paragrafen.
 */
export function toParagraaf(element: Element): string[] {
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
