// vogue vogue sur les_flots
const maxStoire = 10;

var les_flots = [
    "/c28.html",
    "/tordeuze.html",
    "/crakovsoup.html",
];

for(let i=1;i <= maxStoire;i++){
    if(i < 10){
        les_flots.push(`/lazy/stoire0` + i + ".html");
    }else if (i < 100){
        les_flots.push(`/lazy/stoire` + i + ".html");
    }
}

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