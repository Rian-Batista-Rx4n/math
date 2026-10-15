// Criando dicionario para armazenar conjuntos padrões + novos conjuntos criados pelo usuário
const conjuntoElementosDicionario = {
    DIGITOS: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    ALFABETO: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    VOGAL: ["a", "e", "i", "o", "u"],
    CONSOANTE: ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"]
};

let nomeConjuntos = Object.keys(conjuntoElementosDicionario);
console.log(nomeConjuntos); // debug

// adicionando os conjuntos padrões no aside direito
const rightAside = document.getElementById("right-aside");

function renderSets() {
    rightAside.replaceChildren();

    for (const [nome, elementos] of Object.entries(conjuntoElementosDicionario)) {
        const item = document.createElement("div");

        item.className = "set-item";
        item.textContent = `${nome} = {${elementos.join(", ")}}`;

        rightAside.appendChild(item);
    }
}

renderSets();

// função para alternar a exibição do modal de criação de conjunto
function toggleModal() {
    const modal = document.querySelector('.modal-novo-conjunto');
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
}

// função para criar um novo conjunto e elementos do conjunto
function createNewSet() {
    const nameInput = document.getElementById("novo-conjunto-nome");
    const elementsInput = document.getElementById("novo-conjunto-elementos");

    const nome = nameInput.value.trim().toUpperCase();
    const elementos = elementsInput.value.split(",").map(elemento => elemento.trim()).filter(elemento => elemento !== "");

    if (!nome) {
        alert("Informe o nome do conjunto.");
        return;
    }

    if (!/^[A-Z][A-Z0-9_]*$/.test(nome)) {
        alert("Use letras, números e _, começando por uma letra.");
        return;
    }

    if (Object.hasOwn(conjuntoElementosDicionario, nome)) {
        alert(`O conjunto ${nome} já existe.`);
        return;
    }

    if (elementos.length === 0) {
        alert("Informe pelo menos um elemento.");
        return;
    }

    conjuntoElementosDicionario[nome] = elementos;

    renderSets();

    nameInput.value = "";
    elementsInput.value = "";

    toggleModal();
}

// Inserir simbolos no input de fórmulas
function insertSymbol(symbol) {
    const formulaInput = document.getElementById("formula-input");

    const inicio = formulaInput.selectionStart;
    const fim = formulaInput.selectionEnd;
    const valor = formulaInput.value;

    formulaInput.value =
        valor.slice(0, inicio) +
        symbol +
        valor.slice(fim);

    const novaPosicao = inicio + symbol.length;

    formulaInput.focus();
    formulaInput.setSelectionRange(novaPosicao, novaPosicao);

    formulaInput.dispatchEvent(new Event("input", {
        bubbles: true
    }));
}

const formulaInput = document.getElementById("formula-input");
const resultElement = document.querySelector(".result");

formulaInput.addEventListener("input", formulaSolver);

// Função para resolver a fórmula inserida no input
// Função criada com ajuda de Inteligência Artificial (IA) para auxiliar na lógica de resolução de fórmulas matemáticas envolvendo conjuntos.
function formulaSolver() {
    const formula = formulaInput.value.trim();

    resultElement.replaceChildren();

    // Não mostra resultado enquanto o campo estiver vazio.
    if (!formula) {
        return;
    }

    // Verifica se um nome corresponde a um conjunto existente.
    function obterConjunto(nome) {
        const identificador = nome.trim().toUpperCase();

        if (!Object.hasOwn(conjuntoElementosDicionario, identificador)) {
            throw new Error(`O conjunto "${identificador}" não existe.`);
        }

        return conjuntoElementosDicionario[identificador];
    }

    // Verifica se dois conjuntos possuem os mesmos elementos.
    function conjuntosIguais(a, b) {
        return a.length === b.length &&
            a.every(elemento => b.includes(elemento));
    }

    // Remove elementos repetidos, preservando a ordem.
    function removerDuplicados(elementos) {
        return [...new Set(elementos)];
    }

    // Procura uma operação binária na fórmula.
    const operacaoRegex =
        /^(.+?)\s*(∪|∩|−|-|⊆|⊂|∈|∉|=|≠|\bU\b)\s*(.+)$/i;

    const correspondencia = formula.match(operacaoRegex);

    try {
        // Caso 1: a fórmula contém apenas o nome de um conjunto.
        if (!correspondencia) {
            const conjunto = obterConjunto(formula);

            resultElement.textContent =
                `${formula.toUpperCase()} = {${conjunto.join(", ")}}`;

            return;
        }

        const esquerda = correspondencia[1].trim();
        const operador = correspondencia[2].toUpperCase();
        const direita = correspondencia[3].trim();

        // Caso 2: operações entre conjuntos.
        if (["∪", "U", "∩", "−", "-", "=", "≠", "⊆", "⊂"].includes(operador)) {
            const A = obterConjunto(esquerda);
            const B = obterConjunto(direita);

            let resultado;

            switch (operador) {
                case "∪":
                case "U":
                    resultado = removerDuplicados([...A, ...B]);
                    break;

                case "∩":
                    resultado = A.filter(elemento => B.includes(elemento));
                    break;

                case "−":
                case "-":
                    resultado = A.filter(elemento => !B.includes(elemento));
                    break;

                case "=":
                    resultado = conjuntosIguais(A, B);
                    break;

                case "≠":
                    resultado = !conjuntosIguais(A, B);
                    break;

                case "⊆":
                    resultado = A.every(elemento => B.includes(elemento));
                    break;

                case "⊂":
                    resultado =
                        A.every(elemento => B.includes(elemento)) &&
                        !conjuntosIguais(A, B);
                    break;
            }

            if (typeof resultado === "boolean") {
                resultElement.textContent =
                    `${esquerda} ${operador} ${direita}: ${resultado ? "Verdadeiro" : "Falso"}`;
            } else {
                resultElement.textContent =
                    `{${resultado.join(", ")}}`;
            }

            return;
        }

        // Caso 3: verificar pertinência de um elemento.
        if (operador === "∈" || operador === "∉") {
            const conjunto = obterConjunto(direita);
            const pertence = conjunto.includes(esquerda);
            const resultado = operador === "∈" ? pertence : !pertence;

            resultElement.textContent =
                `${esquerda} ${operador} ${direita}: ${resultado ? "Verdadeiro" : "Falso"}`;

            return;
        }

        throw new Error("Operação ainda não implementada.");

    } catch (erro) {
        resultElement.textContent = `Erro: ${erro.message}`;
    }
}
