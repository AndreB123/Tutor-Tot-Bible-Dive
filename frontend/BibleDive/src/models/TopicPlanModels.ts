// TopicPlanModels.ts
export interface TopicPlan {
    id: number;
    title: string;
    objective: string;
    standard: string;
    lessons: Lesson[];
    completed: boolean;
}

export interface Lesson {
    id: number;
    title: string;
    completed: boolean;
}

export type TopicPlans = TopicPlan[];
