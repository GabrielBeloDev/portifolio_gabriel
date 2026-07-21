export interface OwnerFact {
  readonly name: string;
  readonly value: string;
}

export interface CareerYear {
  readonly year: string;
  readonly text: string;
}

export interface FormativeProject {
  readonly name: string;
  readonly text: string;
}

export interface Recognition {
  readonly name: string;
  readonly text: string;
}

// All of this is content the owner wrote about himself, edited for length in
// his voice and grounded in his CV. No invented facts. Site copy rule: no em
// dash, no colon mid-sentence.
export const OWNER_FACTS: readonly OwnerFact[] = [
  { name: "papel", value: "dev full stack na SplitC, fintech com mais de 20 mil usuários" },
  { name: "formação", value: "Ciência da Computação, UFMA (2022 a 2026)" },
  { name: "pesquisa", value: "TeleMídia Lab desde 2022" },
  { name: "local", value: "São Luís, Maranhão" },
  { name: "idiomas", value: "português nativo, inglês avançado" },
  { name: "próximo passo", value: "mestrado em inteligência artificial" },
];

export const OWNER_INTRO =
  "Sou um dev que gosta de entender como as coisas funcionam. Hoje trabalho como desenvolvedor full stack na SplitC, uma fintech com mais de 20 mil usuários, e me formei em Ciência da Computação na UFMA. Entrei na empresa perto de Customer Success e dados no fim de 2024 e fui migrando pro desenvolvimento, então conheço o produto de vários ângulos. Gosto de entender o sistema inteiro, participar das decisões e pesar trade-offs, não só escrever o código que resolve hoje. Acho que software nunca é construído sozinho, então me importo tanto com time e comunicação quanto com o que aparece na tela.";

export const CAREER_TIMELINE: readonly CareerYear[] = [
  {
    year: "2022",
    text: "Entrei em Ciência da Computação na UFMA e no TeleMídia Lab. Foi em Algoritmos I que a computação fez sentido pra mim, quando vi um programa rodando e entendi que dava pra construir coisas a partir da lógica. No laboratório tive meu primeiro contato com código feito em equipe.",
  },
  {
    year: "2023",
    text: "Competições de programação, a Olimpíada Brasileira de Informática, uma menção honrosa no ICPC e um quarto lugar no Techstars Startup Weekend de educação. Foi o ano de descobrir que eu gostava de resolver problema com gente junto.",
  },
  {
    year: "2024",
    text: "Fui monitor de Programação em C e de Estrutura de Dados II, fiquei em primeiro lugar em São Luís na Maratona SBC e recebi menção honrosa na etapa brasileira do ICPC. Também construí um site institucional na Bel Sul. No fim do ano entrei na SplitC, começando perto de Customer Success e dados.",
  },
  {
    year: "2025",
    text: "Virei estagiário de desenvolvimento e depois migrei de vez pro time de software na SplitC. Fiquei em segundo lugar em São Luís na Maratona SBC e apresentei o Reapp no WebMedia.",
  },
  {
    year: "2026",
    text: "Concluí a graduação e virei desenvolvedor full stack na SplitC, trabalhando entre produto, arquitetura, infraestrutura e inteligência artificial.",
  },
];

export const WORK_NOW: readonly string[] = [
  "Quando um card chega, começo tentando entender o que está realmente acontecendo. Investigo o problema, converso com quem está envolvido e penso no impacto da mudança no resto do sistema antes de partir pra implementação. No dia a dia mexo em React, TypeScript e NestJS na plataforma, otimizo consultas no PostgreSQL de produção, escrevo scripts em Golang pra processar dados em lote e cuido de CI/CD e de logs estruturados com correlation ID no Google Cloud. Gosto que a SplitC dá espaço pra participar das decisões de frontend, backend, banco e infraestrutura, e de acompanhar o que acontece depois que a funcionalidade vai pra produção, seja olhando métricas no Grafana, investigando logs ou ouvindo o time de produto.",
  "Hoje também cuido do Firefighterzinho, um bot interno que ajuda a investigar problemas na plataforma. Ele nasceu de um hackathon da empresa e consulta logs, entende parte do contexto do sistema, apoia os times de Customer Success e Produto e organiza os reports de bug com o que encontra. É um projeto que junta IA, arquitetura, observabilidade e contato direto com problema real, com a responsabilidade de decidir o que o agente faz sozinho e o que precisa confirmar antes.",
];

export const FORMATIVE_PROJECTS: readonly FormativeProject[] = [
  {
    name: "Cosmo",
    text: "Meu primeiro projeto sério, uma plataforma pra ajudar alunos a aprender programação, tipo um LeetCode da disciplina de Algoritmos I com gamificação, que chegou a atender mais de 200 estudantes. Feito com React, Node e MySQL, com uma arquitetura em serviços rodando atrás de Docker e Nginx. Entrei bem no começo e mexia em partes pequenas da interface, mas foi ali, no TeleMídia Lab, que tive contato com código feito em equipe e projeto de verdade. Me ensinou a não ter medo de não entender de primeira.",
  },
  {
    name: "Reapp",
    text: "Meu trabalho de conclusão de curso e o projeto de que mais me orgulho. Um aplicativo em React Native com backend em NestJS pra aproximar ONGs do Maranhão de quem quer doar, feito numa parceria da UFMA com a Lancaster University. Foram mais de vinte reuniões em inglês com pesquisadores da Inglaterra e da África do Sul, integração de doações pelo Mercado Pago e a primeira vez que pensei um produto do zero, do banco à arquitetura. Virou publicação no WebMedia 2025 e me mostrou uma pesquisa saindo do papel e virando algo aplicado.",
  },
];

export const RECOGNITION: readonly Recognition[] = [
  {
    name: "WebMedia 2025",
    text: "Artigo sobre o Reapp aceito e apresentado no Workshop de Ferramentas e Aplicações da Sociedade Brasileira de Computação.",
  },
  {
    name: "Maratona SBC de Programação",
    text: "Primeiro lugar em São Luís em 2024 e segundo lugar em 2025 na fase inicial, resolvendo problemas em equipe sob tempo.",
  },
  {
    name: "ICPC Brasil",
    text: "Menção honrosa na etapa brasileira do maior campeonato de programação universitário do mundo.",
  },
  {
    name: "Olimpíada Brasileira de Informática 2023",
    text: "Classificado pra segunda fase, 128º entre mais de 2600 competidores no nível nacional.",
  },
];

export const SKILLS_LEAD =
  "Hoje me sinto pronto pra pegar um problema e ir até o fim, seja uma tarefa full stack, uma investigação de bug ou algo que ninguém sabe de onde vem. Mesmo quando ainda não conheço a tecnologia, vou atrás, investigo e entendo de verdade antes de empurrar uma solução que funciona mais ou menos.";

export const TOOLBOX: readonly string[] = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Golang",
  "Java",
  "C",
  "React",
  "React Native",
  "Next.js",
  "Node",
  "NestJS",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "BigQuery",
  "Redis",
  "Docker",
  "Google Cloud",
  "AWS",
  "Nginx",
  "Playwright",
  "Vitest",
];

export const LEARNING_NOW: readonly string[] = [
  "Terraform",
  "Kubernetes",
  "observabilidade",
  "Prometheus",
  "system design",
  "IA aplicada",
];

export const ARCHITECTURE_TAKE =
  "O que mais me atrai em arquitetura é enxergar o sistema como um todo. Gosto de pensar em como as partes se conectam, pesar o que se ganha e o que se perde em cada decisão e organizar o problema antes de sair implementando. Acho o máximo quando uma escolha técnica deixa o sistema mais simples pra quem desenvolve depois e mais confiável pra quem usa.";

export const FAILURE_TAKE =
  "Uma das experiências que mais me marcaram foi a primeira vez que quebrei algo em produção. Na hora parece que o mundo acabou. Depois você entende que errar faz parte e que o que importa é como você reage, se assume, entende o que houve e ajuda a resolver. Os feedbacks que recebi em conversas de acompanhamento me ensinaram parecido. Nem sempre é fácil ouvir algo sobre o próprio trabalho, mas quase sempre é alguém enxergando o que eu ainda não conseguia ver sozinho. Maturidade pra mim não é nunca quebrar nada, é lidar com o erro sem deixar o medo tomar conta e sair sabendo um pouco mais do que antes.";

export const OFF_CODE: readonly string[] = [
  "Fora do código, sou movido a esporte. Curto futevôlei, musculação e a sensação de estar sempre tentando evoluir, porque sou competitivo até numa pelada com os amigos. Também jogo, principalmente Valorant, pela mesma razão de gostar de perceber onde errei e jogar melhor na próxima.",
  "Valorizo muito o tempo com família e amigos, sou falante e gosto de conhecer gente nova. Viajar também é importante pra mim, o intercâmbio na África do Sul foi uma das melhores experiências que já tive e mudou o jeito que penso sobre sair do lugar comum.",
];

export const CONTACT_CTA =
  "Quero seguir pro mestrado em inteligência artificial e continuar crescendo como dev, assumindo problemas maiores e entendendo cada vez mais como sistemas complexos funcionam. Se você tem um projeto de pesquisa, uma ideia ou só quer trocar sobre IA, arquitetura ou infraestrutura, me chama.";
