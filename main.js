// main.js

// ##########################################################################
// #                           CONFIGURAÇÕES GERAIS                         #
// ##########################################################################
// Altere apenas os valores entre as aspas simples ('...') aqui.
// Esta seção é o coração das suas personalizações!

const config = {
  global: {
    CNPJ: '20.000.000/0000-00',
    COMPANY_NAME: 'Sua Empresa LTDA'
  },


  quizPage: {
    RTK_PRECLICK_LINK: 'https://rtk.nethealthtry.com/preclick'
  },


  sitePages: {
    SITE_DOMAIN: 'https://aaaeusite.com'
  }
};


// ##########################################################################
// #                 NÃO É NECESSÁRIO ALTERAR NADA ABAIXO                  #
// #       Esta é a lógica que faz as substituições automáticas.          #
// ##########################################################################


// Função para determinar qual conjunto de variáveis usar com base na URL da página.
function getPageVars() {
  const path = window.location.pathname;
  // Divide o caminho da URL em segmentos e remove quaisquer segmentos vazios.
  const segments = path.split('/').filter(Boolean);
  // Pega o último segmento, que geralmente é o nome do arquivo (ex: 'index.html').
  const file = segments.pop();

  // Começa com as variáveis globais (CNPJ, COMPANY_NAME) que se aplicam a todas as páginas.
  let vars = { ...config.global };

  // Verifica se a página atual é uma das páginas de termos, privacidade, contato, etc.
  if (file === 'terms.html' || file === 'privacy.html' || file === 'contact.html' || file === 'shipping.html' || file === 'return.html') {
    // Se for, adiciona as variáveis específicas para essas páginas (SITE_DOMAIN).
    vars = { ...vars, ...config.sitePages };
  }
  // Verifica se é a página principal do quiz (um 'index.html' que não está na pasta 'home/').
  // Isso é útil se o seu quiz estiver em subpastas como 'QUIZ-VSL/index.html' ou 'quiz/index.html'.
  else if (file === 'index.html' && segments[0] !== 'home') {
    // Se for o quiz, adiciona as variáveis específicas do quiz (RTK_PRECLICK_LINK).
    vars = { ...vars, ...config.quizPage };
  }
  // Verifica se é a página de vídeo/notícias (um 'index.html' dentro da pasta 'home/').
  // Esta condição é para o 'QUIZ-VSL/home/index.html'.
  else if (file === 'index.html' && segments[0] === 'home') {
    // Para esta página, apenas as variáveis globais são aplicadas automaticamente
    // (pois os scripts VTurb e RTK de rastreamento são inseridos manualmente).
    // Não há uma seção específica de 'slugRoot' no config para substituições JS.
  }

  return vars;
}

// Função para substituir placeholders (como {{VARIAVEL}}) por seus valores reais.
function replaceTemplate(str, vars) {
  // Procura por qualquer texto no formato {{CHAVE}} e o substitui.
  return str.replace(/{{(\w+)}}/g, (_, key) => {
    // Retorna o valor da variável, ou uma string vazia se a variável não existir.
    // As chaves dos scripts críticos (que são coladas manualmente no HTML)
    // não estarão em 'vars', então elas simplesmente não serão substituídas
    // e permanecerão no HTML se por algum motivo você as mantiver.
    return vars[key] ?? '';
  });
}

// Quando todo o conteúdo HTML da página estiver carregado e pronto para manipulação...
document.addEventListener('DOMContentLoaded', () => {
  const vars = getPageVars(); // Obtém as variáveis apropriadas para a página atual.
  const root = document.documentElement; // Pega o elemento raiz do documento (<html>).

  // Percorre todos os elementos da página para substituir placeholders em seus atributos.
  root.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      // Garante que não tentamos modificar o atributo 'src' de tags <script>,
      // pois esses scripts são inseridos manualmente no HTML.
      if (!(el.tagName === 'SCRIPT' && attr.name === 'src')) {
        const newVal = replaceTemplate(attr.value, vars);
        // Se a substituição alterou o valor, atualiza o atributo no HTML.
        if (newVal !== attr.value) {
          el.setAttribute(attr.name, newVal);
        }
      }
    });
  });

  // Percorre todos os nós de texto na página para substituir placeholders em textos.
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while (node = walker.nextNode()) {
    const newText = replaceTemplate(node.textContent, vars);
    // Se a substituição alterou o texto, atualiza o nó de texto no HTML.
    if (newText !== node.textContent) {
      node.textContent = newText;
    }
  }

  // Para depuração: Descomente a linha abaixo para ver no console do navegador
  // quais variáveis foram carregadas e estão ativas para a página atual.
  console.log("Variáveis carregadas para esta página:", vars);
});