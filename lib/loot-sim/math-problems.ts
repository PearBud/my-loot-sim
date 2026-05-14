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
  {
    question: String.raw`\lim_{x \to 0} \frac{\sin(12x)}{\sin(4x)}`,
    answer: 3,
  },
  {
    question: String.raw`\lim_{x \to 0} \frac{e^{6x}-1}{2x}`,
    answer: 3,
  },
  {
    question: String.raw`\lim_{x \to 0} \frac{\ln(1+8x)}{x}`,
    answer: 8,
  },
  {
    question: String.raw`\int_0^4 x\,dx`,
    answer: 8,
  },
  {
    question: String.raw`\int_0^3 \left(2x+1\right)\,dx`,
    answer: 12,
  },
  {
    question: String.raw`\int_0^1 20x^3\,dx`,
    answer: 5,
  },
  {
    question: String.raw`\int_0^{\pi/2} 6\sin x\,dx`,
    answer: 6,
  },
  {
    question: String.raw`\int_0^2 \int_0^2 xy\,dy\,dx`,
    answer: 4,
  },
  {
    question: String.raw`\lim_{n \to \infty} n\left(\sqrt{n^2+10n}-n\right) \cdot \frac{1}{n}`,
    answer: 5,
  },
  {
    question: String.raw`\int_1^3 3x^2\,dx`,
    answer: 26,
  },
  {
    question: String.raw`\int_0^1 \int_0^x 24xy\,dy\,dx`,
    answer: 3,
  },
  {
    question: String.raw`\int_0^2 \int_0^y 6x\,dx\,dy`,
    answer: 8,
  },
  {
    question: String.raw`\lim_{x \to 0} \frac{1-\cos(4x)}{x^2}`,
    answer: 8,
  },
  {
    question: String.raw`\lim_{x \to 0} \frac{\sin(5x)-\sin(3x)}{x}`,
    answer: 2,
  },
  {
    question: String.raw`\int_0^1 \left(30x^4-12x^2\right)\,dx`,
    answer: 2,
  },
  {
    question: String.raw`\int_0^2 \left(x+1\right)^3\,dx`,
    answer: 20,
  },
  {
    question: String.raw`\int_0^{\pi/2} 8\sin x\cos x\,dx`,
    answer: 4,
  },
  {
    question: String.raw`\lim_{n \to \infty} n\left(\ln(n+7)-\ln n\right)`,
    answer: 7,
  },
  {
    question: String.raw`\int_0^1 \int_0^1 \int_0^1 64xyz\,dz\,dy\,dx`,
    answer: 8,
  },
  {
    question: String.raw`\int_{-2}^2 \left(3x^2+2\right)\,dx`,
    answer: 24,
  },
];
