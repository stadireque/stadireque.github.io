// vogue vogue sur les_flots
const maxStoire = 12;

var tmp = [
    "/c28.html",
    "/tordeuze.html",
    "/crakovsoup.html",
    "/regles.html",
    "/werkstadtengruppen.html",
    "/y.html",
    "/flibelieve.html",
];

for(let i=1;i <= maxStoire;i++){
    if(i < 10){
        tmp.push(`/lazy/stoire0` + i + ".html");
    }else if (i < 100){
        tmp.push(`/lazy/stoire` + i + ".html");
    }
}

var les_flots = [];
while(tmp.length > 0){
    let i = Math.floor(Math.random() * tmp.length);
    les_flots.push(tmp[i]);
    tmp.splice(i, 1);
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