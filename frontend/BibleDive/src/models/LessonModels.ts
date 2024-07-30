import { Test } from "./TestModels";

export interface Lesson {
    id: number;
    title: string;
    topic_plan_id: number;
    objective: string;
    information: string;
    tests: Test[];
    completed: boolean;
}