import type {
  CharacterBuilderPart,
  ThisOrThatPrompt,
  TriviaQuestion,
} from "@/types";

export const THIS_OR_THAT_PROMPTS: ThisOrThatPrompt[] = [
  { id: "tot-1", optionA: "Coffee", optionB: "Tea" },
  { id: "tot-2", optionA: "Async updates", optionB: "Live standups" },
  { id: "tot-3", optionA: "Plan ahead", optionB: "Adapt on the fly" },
  { id: "tot-4", optionA: "Deep focus blocks", optionB: "Quick collaboration bursts" },
  { id: "tot-5", optionA: "Ship small", optionB: "Ship polished" },
];

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: "trivia-1",
    question: "What planet is known as the Red Planet?",
    answer: "Mars",
    hint: "Fourth planet from the Sun",
  },
  {
    id: "trivia-2",
    question: "How many continents are there on Earth?",
    answer: "7",
    hint: "Includes Antarctica",
  },
  {
    id: "trivia-3",
    question: "What is the chemical symbol for gold?",
    answer: "Au",
    hint: "From the Latin aurum",
  },
  {
    id: "trivia-4",
    question: "Which ocean is the largest?",
    answer: "Pacific",
  },
  {
    id: "trivia-5",
    question: "What year did the first iPhone launch?",
    answer: "2007",
  },
];

export const CHARACTER_BUILDER_PARTS: CharacterBuilderPart[] = [
  { id: "face-happy", category: "face", label: "Happy", emoji: "😊" },
  { id: "face-focused", category: "face", label: "Focused", emoji: "🧐" },
  { id: "face-tired", category: "face", label: "Tired", emoji: "😴" },
  { id: "face-excited", category: "face", label: "Excited", emoji: "🤩" },
  { id: "face-calm", category: "face", label: "Calm", emoji: "😌" },
  { id: "acc-headphones", category: "accessory", label: "Headphones", emoji: "🎧" },
  { id: "acc-coffee", category: "accessory", label: "Coffee", emoji: "☕" },
  { id: "acc-laptop", category: "accessory", label: "Laptop", emoji: "💻" },
  { id: "acc-plant", category: "accessory", label: "Plant", emoji: "🪴" },
  { id: "bg-sprint", category: "background", label: "Sprint board", emoji: "📋" },
  { id: "bg-sunrise", category: "background", label: "Sunrise", emoji: "🌅" },
  { id: "bg-office", category: "background", label: "Office", emoji: "🏢" },
];

export function getCharacterPartsByCategory(
  category: CharacterBuilderPart["category"],
): CharacterBuilderPart[] {
  return CHARACTER_BUILDER_PARTS.filter((part) => part.category === category);
}

export function getTriviaQuestionById(id: string): TriviaQuestion | undefined {
  return TRIVIA_QUESTIONS.find((question) => question.id === id);
}

export function getThisOrThatPromptById(id: string): ThisOrThatPrompt | undefined {
  return THIS_OR_THAT_PROMPTS.find((prompt) => prompt.id === id);
}

export function checkTriviaAnswer(questionId: string, answer: string): boolean {
  const question = getTriviaQuestionById(questionId);
  if (!question) {
    return false;
  }
  return question.answer.toLowerCase() === answer.trim().toLowerCase();
}
