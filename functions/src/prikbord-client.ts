import {Element} from 'jsdom';
import {Bericht} from './bericht';
import {extract, toParagraaf} from './generic';


export async function getPrikbordBerichten() {
    return extract('index.php/prikbord', 'div.easy_frame', mapToBericht);
}

function mapToBericht(node: Element): Bericht {
    const auteur = node.querySelector('.easy_big').textContent.trim();
    const tijdstip = node.querySelector('.easy_small').textContent.trim(); //moment
    const content = node.querySelector('.easy_content');
    return {
        auteur: auteur,
        tijdstip: tijdstip, // format
        berichttekst: toParagraaf(content)
    };
}
