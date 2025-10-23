export interface StackOverflowTag {
  name: string;
  count: number;
}

export interface StackOverflowQuestion {
  question_id: number;
  title: string;
  view_count: number;
  answer_count: number;
  score: number;
  tags: string[];
}
