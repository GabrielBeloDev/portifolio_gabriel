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

// filled from the owner's answers — see ticket in backlog
export const PERSONAL_MILESTONES: readonly JourneyMilestone[] = [];

// filled from the owner's answers — see ticket in backlog
export const LESSONS_LEARNED: readonly LessonLearned[] = [];

// filled from the owner's answers — see ticket in backlog
export const CONTACT_CTA: string | null = null;
