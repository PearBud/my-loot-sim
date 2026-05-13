export type MathProblem = {
  question: string;
  answer: number;
};

export const MATH_PROBLEMS: readonly MathProblem[] = [
  {
    question: String.raw`\lim_{x \to 0} \frac{\sin(7x)}{\sin x}`,
    answer: 7,
  },
  {
    question: String.raw`\lim_{x \to 0} \frac{e^{5x}-1}{x}`,
    answer: 5,
  },
  {
    question: String.raw`\lim_{x \to \infty} x\left(\sqrt{x^2+6x}-x\right) \cdot \frac{1}{x}`,
    answer: 3,
  },
  {
    question: String.raw`\int_0^3 2x\,dx`,
    answer: 9,
  },
  {
    question: String.raw`\int_0^2 \left(3x^2+2x\right)\,dx`,
    answer: 12,
  },
  {
    question: String.raw`\int_0^{\pi} \sin x\,dx`,
    answer: 2,
  },
  {
    question: String.raw`\int_0^1 \int_0^2 3xy\,dy\,dx`,
    answer: 3,
  },
  {
    question: String.raw`\int_0^2 \int_0^1 \left(x+y\right)\,dy\,dx`,
    answer: 3,
  },
  {
    question: String.raw`\int_0^1 12x^2\,dx`,
    answer: 4,
  },
  {
    question: String.raw`\lim_{n \to \infty} n\left(\sqrt{n^2+8n}-n\right) \cdot \frac{1}{n}`,
    answer: 4,
  },
];
