export interface Test {
    id: number;
    title: string;
    question_count: number;
    questions: Question[];
    lesson_id: number;
    passed: boolean;
}

export interface Question {
    question_text: string;
    type: QuestionType;
    option: string[];
    answer: string;
    answer_index: number;
    matches: string[];
}

export interface QuestionType {
    multiple_choice: string;
    fill_in_the_blank: string;
    short_answer: string;
    match_options: string;
}