// vogue vogue sur les_flots
const les_flots = [
    "/c28.html",
    "/tordeuze.html",
    "/lazy/stoire01.html",
    "/lazy/stoire02.html",
    "/lazy/stoire03.html",
    "/crakovsoup.html",
    "/lazy/stoire04.html",
    "/lazy/stoire05.html",
    "/lazy/stoire06.html",
];

function flotter(){
    const navire = document.createElement('ul');
    navire.setAttribute('id', 'navire');
    navire.classList.add('navire');
        
    les_flots.forEach(vague => {
        let v = document.createElement('li');
        let va = document.createElement('a');
        va.setAttribute('href', vague);
        va.appendChild(document.createTextNode(vague));
        v.appendChild(va);
        navire.appendChild(v);
    });
    document.body.insertBefore(navire, document.body.firstChild);
}