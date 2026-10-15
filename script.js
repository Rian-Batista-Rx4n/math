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
        // Etapa 1: transformar a fórmula em tokens.
        function tokenizar(expressao) {
            const tokens = [];
            const regex =
                /\s*([A-Za-z][A-Za-z0-9_]*|\d+(?:\.\d+)?|∅|[()∪∩−⊆⊂∈∉=≠¬∧∨])/y;

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
        let posicao = 0;

        const operadoresComparacao = ["⊆", "⊂", "∈", "∉", "=", "≠"];
        const operadoresConjunto = ["∪", "∩", "−"];

        function exigirBooleano(valor, operador) {
            if (valor.tipo !== "booleano") {
                throw new Error(
                    `O operador "${operador}" precisa de uma proposição verdadeira ou falsa.`
                );
            }

            return valor.valor;
        }

        function exigirConjunto(valor, operador) {
            if (valor.tipo !== "conjunto") {
                throw new Error(
                    `O operador "${operador}" precisa de conjuntos.`
                );
            }

            return valor.valor;
        }

        function booleano(valor) {
            return { tipo: "booleano", valor };
        }

        // Etapa 2: ler um elemento, conjunto ou expressão entre parênteses.
        function lerPrimario() {
            const token = tokens[posicao];

            if (token === undefined) {
                throw new Error("Era esperado um conjunto ou uma expressão.");
            }

            if (token === "∅") {
                posicao++;
                return { tipo: "conjunto", valor: [] };
            }

            if (token === "(") {
                posicao++;

                const resultado = lerDisjuncao();

                if (tokens[posicao] !== ")") {
                    throw new Error("Está faltando um parêntese de fechamento ')'.");
                }

                posicao++;
                return resultado;
            }

            if (/^[A-Za-z][A-Za-z0-9_]*$/.test(token)) {
                posicao++;

                const nome = token.toUpperCase();

                if (Object.hasOwn(conjuntoElementosDicionario, nome)) {
                    return {
                        tipo: "conjunto",
                        valor: [...conjuntoElementosDicionario[nome]]
                    };
                }

                // Identificadores desconhecidos podem ser elementos
                // em expressões como a ∈ VOGAL.
                return { tipo: "elemento", valor: token };
            }

            if (/^\d+(?:\.\d+)?$/.test(token)) {
                posicao++;
                return { tipo: "elemento", valor: token };
            }

            throw new Error(`Expressão inesperada: "${token}".`);
        }

        // Etapa 3: união, interseção e diferença.
        function lerExpressaoConjunto() {
            let resultado = lerPrimario();

            while (operadoresConjunto.includes(tokens[posicao])) {
                const operador = tokens[posicao++];

                const A = exigirConjunto(resultado, operador);
                const B = exigirConjunto(lerPrimario(), operador);

                if (operador === "∩") {
                    resultado = {
                        tipo: "conjunto",
                        valor: A.filter(elemento => B.includes(elemento))
                    };
                } else if (operador === "−") {
                    resultado = {
                        tipo: "conjunto",
                        valor: A.filter(elemento => !B.includes(elemento))
                    };
                } else {
                    resultado = {
                        tipo: "conjunto",
                        valor: [...new Set([...A, ...B])]
                    };
                }
            }

            return resultado;
        }

        // Etapa 4: comparações entre conjuntos e pertinência.
        function lerComparacao() {
            const esquerda = lerExpressaoConjunto();
            const operador = tokens[posicao];

            if (!operadoresComparacao.includes(operador)) {
                return esquerda;
            }

            posicao++;

            const direita = lerExpressaoConjunto();
            let resultado;

            if (operador === "∈" || operador === "∉") {
                const elemento = esquerda.tipo === "elemento"
                    ? esquerda.valor
                    : null;

                const conjunto = exigirConjunto(direita, operador);

                if (elemento === null) {
                    throw new Error(
                        `À esquerda de ${operador}, informe um único elemento.`
                    );
                }

                const pertence = conjunto.includes(elemento);

                resultado = operador === "∈" ? pertence : !pertence;
            } else {
                const A = new Set(exigirConjunto(esquerda, operador));
                const B = new Set(exigirConjunto(direita, operador));

                const iguais =
                    A.size === B.size &&
                    [...A].every(elemento => B.has(elemento));

                switch (operador) {
                    case "=":
                        resultado = iguais;
                        break;

                    case "≠":
                        resultado = !iguais;
                        break;

                    case "⊆":
                        resultado = [...A].every(elemento => B.has(elemento));
                        break;

                    case "⊂":
                        resultado =
                            [...A].every(elemento => B.has(elemento)) &&
                            !iguais;
                        break;
                }
            }

            return booleano(resultado);
        }

        // Etapa 5: negação.
        function lerNegacao() {
            if (tokens[posicao] === "¬") {
                posicao++;

                const resultado = lerNegacao();

                return booleano(!exigirBooleano(resultado, "¬"));
            }

            return lerComparacao();
        }

        // Etapa 6: conjunção (E).
        function lerConjuncao() {
            let resultado = lerNegacao();

            while (tokens[posicao] === "∧") {
                posicao++;

                const A = exigirBooleano(resultado, "∧");
                const B = exigirBooleano(lerNegacao(), "∧");

                resultado = booleano(A && B);
            }

            return resultado;
        }

        // Etapa 7: disjunção (OU).
        function lerDisjuncao() {
            let resultado = lerConjuncao();

            while (tokens[posicao] === "∨") {
                posicao++;

                const A = exigirBooleano(resultado, "∨");
                const B = exigirBooleano(lerConjuncao(), "∨");

                resultado = booleano(A || B);
            }

            return resultado;
        }

        // Etapa 8: executar a fórmula.
        const resultado = lerDisjuncao();

        if (posicao < tokens.length) {
            throw new Error(
                `Operador ou símbolo inesperado: "${tokens[posicao]}".`
            );
        }

        if (resultado.tipo === "conjunto") {
            resultElement.textContent =
                `{${resultado.valor.join(", ")}}`;
        } else if (resultado.tipo === "booleano") {
            resultElement.textContent =
                resultado.valor ? "Verdadeiro" : "Falso";
        } else {
            throw new Error(
                "Informe uma operação de conjunto ou uma proposição lógica."
            );
        }

    } catch (erro) {
        resultElement.textContent = `Erro: ${erro.message}`;
    }
}
