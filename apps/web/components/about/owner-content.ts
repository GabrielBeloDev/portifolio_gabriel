export interface JourneyMilestone {
  readonly date: string;
  readonly label: string;
  readonly href?: string;
  readonly external?: boolean;
}

export interface LessonLearned {
  readonly project: string;
  readonly lesson: string;
}

export interface OwnerFact {
  readonly name: string;
  readonly value: string;
}

// Facts stated directly by the owner on 2026-07-18; undated facts live here
// instead of the journey log so no date is ever invented
export const OWNER_FACTS: readonly OwnerFact[] = [
  { name: "papel", value: "arquiteto de software · dev na SplitC" },
  { name: "formação", value: "Ciência da Computação (UFMA)" },
  { name: "local", value: "São Luís · MA" },
  { name: "próximo passo", value: "mestrado" },
];

export const OWNER_INTRO =
  "Sou um dev que gosta de entender como as coisas funcionam. Trabalho como arquiteto de software e desenvolvedor na SplitC, me formei em Ciência da Computação na UFMA e estou de olho num mestrado. Escrevo aqui porque escrever é o jeito mais honesto que encontrei de entender o que estou estudando.";

export const PERSONAL_MILESTONES: readonly JourneyMilestone[] = [
  {
    date: "2022-08-01",
    label:
      "entrei em Ciência da Computação na UFMA e encostei em código pela primeira vez; foi em Algoritmos 1 que fiz a primeira coisa que realmente funcionou",
  },
];

// filled from the owner's answers — see ticket in backlog
export const LESSONS_LEARNED: readonly LessonLearned[] = [];

// filled from the owner's answers — see ticket in backlog
export const CONTACT_CTA: string | null = null;
