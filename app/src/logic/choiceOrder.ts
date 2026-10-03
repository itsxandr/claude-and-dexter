// The order the choices are shown in on the Question screen.
// The AI tends to put the right answer first. Old saved packs still have it
// there, so the screen shuffles the choices every time a question is shown.
// Pure logic: `random` is passed in, so tests can fix it.

// Returns the choice indexes in a random order, e.g. 3 -> [2, 0, 1].
// Uses the Fisher–Yates shuffle: every order is equally likely.
export function shuffledOrder(count: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length: count }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}
