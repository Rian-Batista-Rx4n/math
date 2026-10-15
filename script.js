// Criando dicionario para armazenar conjuntos padrões + novos conjuntos criados pelo usuário
const conjuntoElementosDicionario = {
    DIGITOS: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    ALFABETO: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    VOGAL: ["a", "e", "i", "o", "u"],
    CONSOANTE: ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"]
};

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
    let nomeConjuntos = Object.keys(conjuntoElementosDicionario);
    console.log(nomeConjuntos); // debug NOMES
    console.log(conjuntoElementosDicionario); // debug CONJUNTOS COMPLETOS
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

    if (!formula) return;

    try {
        // Etapa 1: separar a fórmula em tokens.
        function tokenizar(expressao) {
            const tokens = [];
            const regex =
                /\s*([A-Za-z][A-Za-z0-9_]*|\d+(?:\.\d+)?|∅|[()∪∩−⊆⊂∈∉=≠])/y;

            let posicao = 0;

            while (posicao < expressao.length) {
                regex.lastIndex = posicao;
                const correspondencia = regex.exec(expressao);

                if (!correspondencia) {
                    throw new Error(
                        `Símbolo inválido na posição ${posicao + 1}: "${expressao[posicao]}".`
                    );
                }

                tokens.push(correspondencia[1]);
                posicao = regex.lastIndex;
            }

            return tokens;
        }

        const tokens = tokenizar(formula);

        // Etapa 2: procurar um operador de comparação fora dos parênteses.
        function separarComparacao(tokens) {
            let profundidade = 0;
            let comparacao = null;

            const operadores = ["⊆", "⊂", "∈", "∉", "=", "≠"];

            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i] === "(") profundidade++;
                if (tokens[i] === ")") profundidade--;

                if (profundidade < 0) {
                    throw new Error("Parêntese de fechamento sem abertura.");
                }

                if (profundidade === 0 && operadores.includes(tokens[i])) {
                    if (comparacao !== null) {
                        throw new Error(
                            "Use apenas uma comparação por fórmula nesta versão."
                        );
                    }

                    comparacao = i;
                }
            }

            if (profundidade !== 0) {
                throw new Error("Os parênteses não estão fechados corretamente.");
            }

            if (comparacao === null) {
                return null;
            }

            const esquerda = tokens.slice(0, comparacao);
            const operador = tokens[comparacao];
            const direita = tokens.slice(comparacao + 1);

            if (!esquerda.length || !direita.length) {
                throw new Error("A comparação precisa ter os dois operandos.");
            }

            return { esquerda, operador, direita };
        }

        // Etapa 3: analisar e calcular expressões de conjuntos.
        function avaliarConjunto(tokens) {
            let posicao = 0;

            function lerPrimario() {
                const token = tokens[posicao];

                if (token === undefined) {
                    throw new Error("Era esperado um conjunto.");
                }

                if (token === "∅") {
                    posicao++;
                    return [];
                }

                if (token === "(") {
                    posicao++;

                    const resultado = lerUniao();

                    if (tokens[posicao] !== ")") {
                        throw new Error("Está faltando um ')'.");
                    }

                    posicao++;
                    return resultado;
                }

                if (/^[A-Za-z][A-Za-z0-9_]*$/.test(token)) {
                    posicao++;

                    const nome = token.toUpperCase();

                    if (!Object.hasOwn(conjuntoElementosDicionario, nome)) {
                        throw new Error(`O conjunto "${nome}" não existe.`);
                    }

                    return [...conjuntoElementosDicionario[nome]];
                }

                throw new Error(`Expressão inesperada: "${token}".`);
            }

            function lerIntersecao() {
                let resultado = lerPrimario();

                while (tokens[posicao] === "∩") {
                    posicao++;

                    const direita = lerPrimario();

                    resultado = resultado.filter(
                        elemento => direita.includes(elemento)
                    );
                }

                return resultado;
            }

            function lerUniao() {
                let resultado = lerIntersecao();

                while (
                    tokens[posicao] === "∪" ||
                    tokens[posicao] === "−"
                ) {
                    const operador = tokens[posicao++];

                    const direita = lerIntersecao();

                    if (operador === "∪") {
                        resultado = [...new Set([...resultado, ...direita])];
                    } else {
                        resultado = resultado.filter(
                            elemento => !direita.includes(elemento)
                        );
                    }
                }

                return resultado;
            }

            const resultado = lerUniao();

            if (posicao < tokens.length) {
                throw new Error(
                    `Operador inesperado: "${tokens[posicao]}".`
                );
            }

            return resultado;
        }

        // Etapa 4: resolver a expressão ou a comparação.
        const comparacao = separarComparacao(tokens);

        if (comparacao === null) {
            const resultado = avaliarConjunto(tokens);

            resultElement.textContent = `{${resultado.join(", ")}}`;
            return;
        }

        const { esquerda, operador, direita } = comparacao;
        let resultado;

        if (operador === "∈" || operador === "∉") {
            // O lado esquerdo é um elemento, não um conjunto.
            if (esquerda.length !== 1 || ["(", ")", "∅"].includes(esquerda[0])) {
                throw new Error(
                    "À esquerda de ∈ ou ∉, informe um único elemento."
                );
            }

            const elemento = esquerda[0];
            const conjunto = avaliarConjunto(direita);
            const pertence = conjunto.includes(elemento);

            resultado = operador === "∈" ? pertence : !pertence;
        } else {
            // As comparações restantes recebem dois conjuntos.
            const A = avaliarConjunto(esquerda);
            const B = avaliarConjunto(direita);

            const conjuntoA = new Set(A);
            const conjuntoB = new Set(B);

            const iguais =
                conjuntoA.size === conjuntoB.size &&
                [...conjuntoA].every(elemento => conjuntoB.has(elemento));

            switch (operador) {
                case "=":
                    resultado = iguais;
                    break;

                case "≠":
                    resultado = !iguais;
                    break;

                case "⊆":
                    resultado = [...conjuntoA].every(
                        elemento => conjuntoB.has(elemento)
                    );
                    break;

                case "⊂":
                    resultado =
                        [...conjuntoA].every(
                            elemento => conjuntoB.has(elemento)
                        ) && !iguais;
                    break;
            }
        }

        resultElement.textContent =
            `${esquerda.join(" ")} ${operador} ${direita.join(" ")}: ` +
            (resultado ? "Verdadeiro" : "Falso");

    } catch (erro) {
        resultElement.textContent = `Erro: ${erro.message}`;
    }
}

