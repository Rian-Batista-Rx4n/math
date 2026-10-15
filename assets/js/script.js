const rightAside = document.getElementById('right-aside');
// Criando dicionario para armazenar conjuntos padrões + novos conjuntos criados pelo usuário
let conjuntoElementosDicionario = {
    "DIGITOS": ["{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}"],
    "ALFABETO": ["{A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z}"],
    "VOGAL": ["{A, E, I, O, U}"],
    "CONSOANTE": ["{B, C, D, F, G, H, J, K, L, M, N, P, Q, R, S, T, V, W, X, Y, Z}"],
};
let nomeConjuntos = Object.keys(conjuntoElementosDicionario);
console.log(nomeConjuntos); // debug

// adicionando os conjuntos padrões no aside direito
rightAside.innerHTML += `<div class="set-item">DIGITOS = {${conjuntoElementosDicionario["DIGITOS"][0]}}</div>`;
rightAside.innerHTML += `<div class="set-item">ALFABETO = {${conjuntoElementosDicionario["ALFABETO"][0]}}</div>`;
rightAside.innerHTML += `<div class="set-item">VOGAL = {${conjuntoElementosDicionario["VOGAL"][0]}}</div>`;
rightAside.innerHTML += `<div class="set-item">CONSOANTE = {${conjuntoElementosDicionario["CONSOANTE"][0]}}</div>`;

// função para alternar a exibição do modal de criação de conjunto
function toggleModal() {
    const modal = document.querySelector('.modal-novo-conjunto');
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
}

// função para criar um novo conjunto e elementos do conjunto
function createNewSet() {
    const nameInput = document.querySelector('.novo-conjunto-input[type="text"]:nth-of-type(1)');
    const elementsInput = document.querySelector('.novo-conjunto-input[type="text"]:nth-of-type(2)');

    const rightAside = document.getElementById('right-aside');

    const name = nameInput.value.trim().toUpperCase();
    const elements = elementsInput.value.trim();

    if (name in conjuntoElementosDicionario) {
        console.warn(`O conjunto "${name}" já existe.`);
        return;
    } else {
        conjuntoElementosDicionario[name] = [elements];
        rightAside.innerHTML += `<div class="set-item">${name} = {${elements}}</div>`;
    }

    console.log(`${name} = {${conjuntoElementosDicionario}}`); // debug
}

function insertSymbol(symbol) {
    const formulaInput = document.querySelector('#formula-input');
    formulaInput.value += symbol;
}

const formulaElement = document.querySelector('#formula-input');
formulaElement.addEventListener('change', formulaSolver);

function formulaSolver() {
    const formulaElement = document.querySelector('#formula-input');
    const resultElement = document.querySelector('.result');

    let result = ''
    resultElement.innerHTML = result;
}