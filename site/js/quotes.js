// The quote of the day, shown once all of today's dailies are done.
// Every line is public domain (authors long dead, translations published before 1929) and was checked
// word for word against its original text. They are chosen to fit the idea of dailies: getting outside,
// moving, rest, simplicity, the day itself, friendship, gratitude. Please keep to that when adding one.
// A "\n" is a line break in verse; "…" marks an omission.
export const QUOTES = [
  { text: 'Morning is when I am awake and there is a dawn in me.', by: 'Henry David Thoreau', from: 'Walden' },
  { text: 'Heaven is under our feet as well as over our heads.', by: 'Henry David Thoreau', from: 'Walden' },
  { text: 'Our life is frittered away by detail. … Simplicity, simplicity, simplicity!', by: 'Henry David Thoreau', from: 'Walden' },
  { text: 'I went to the woods because I wished to live deliberately.', by: 'Henry David Thoreau', from: 'Walden' },
  { text: 'Every morning was a cheerful invitation to make my life of equal simplicity, and I may say innocence, with Nature herself.', by: 'Henry David Thoreau', from: 'Walden' },
  { text: 'There is more day to dawn. The sun is but a morning star.', by: 'Henry David Thoreau', from: 'Walden' },
  { text: 'To affect the quality of the day, that is the highest of arts.', by: 'Henry David Thoreau', from: 'Walden' },
  { text: 'In Wildness is the preservation of the World.', by: 'Henry David Thoreau', from: 'Walking' },
  { text: 'The language of friendship is not words, but meanings.', by: 'Henry David Thoreau', from: 'A Week on the Concord and Merrimack Rivers' },
  { text: 'Write it on your heart that every day is the best day in the year.', by: 'Ralph Waldo Emerson', from: 'Society and Solitude' },
  { text: 'Leave this military hurry and adopt the pace of Nature. Her secret is patience.', by: 'Ralph Waldo Emerson', from: 'Lectures and Biographical Sketches' },
  { text: 'The first wealth is health.', by: 'Ralph Waldo Emerson', from: 'The Conduct of Life' },
  { text: 'The only way to have a friend is to be one.', by: 'Ralph Waldo Emerson', from: 'Essays: First Series' },
  { text: 'The health of the eye seems to demand a horizon.', by: 'Ralph Waldo Emerson', from: 'Nature' },
  { text: 'To the body and mind which have been cramped by noxious work or company, nature is medicinal and restores their tone.', by: 'Ralph Waldo Emerson', from: 'Nature' },
  { text: 'In the woods, we return to reason and faith.', by: 'Ralph Waldo Emerson', from: 'Nature' },
  { text: 'Everybody needs beauty as well as bread, places to play in and pray in, where Nature may heal and cheer and give strength to body and soul alike.', by: 'John Muir', from: 'The Yosemite' },
  { text: 'In every walk with nature one receives far more than he seeks.', by: 'John Muir', from: 'Steep Trails' },
  { text: 'While we are postponing, life speeds by.', by: 'Seneca, tr. Richard M. Gummere', from: 'Moral Letters' },
  { text: 'Hold every hour in your grasp.', by: 'Seneca, tr. Richard M. Gummere', from: 'Moral Letters' },
  { text: 'Associate with those who will make a better man of you.', by: 'Seneca, tr. Richard M. Gummere', from: 'Moral Letters' },
  { text: 'Begin at once to live, and count each separate day as a separate life.', by: 'Seneca, tr. Richard M. Gummere', from: 'Moral Letters' },
  { text: 'In the morning when thou risest unwillingly, let this thought be present,—I am rising to the work of a human being.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations' },
  { text: 'No longer talk at all about the kind of man that a good man ought to be, but be such.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations' },
  { text: 'Think not so much of what thou hast not as of what thou hast.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations' },
  { text: 'Very little indeed is necessary for living a happy life.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations' },
  { text: 'Look within. Within is the fountain of good, and it will ever bubble up, if thou wilt ever dig.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations' },
  { text: 'Do not act as if thou wert going to live ten thousand years.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations' },
  { text: 'Every habit and faculty is maintained and increased by the corresponding actions: the habit of walking by walking, the habit of running by running.', by: 'Epictetus, tr. George Long', from: 'Discourses' },
  { text: 'Afoot and light-hearted I take to the open road,\nHealthy, free, the world before me.', by: 'Walt Whitman', from: 'Leaves of Grass' },
  { text: 'Now I see the secret of the making of the best persons,\nIt is to grow in the open air and to eat and sleep with the earth.', by: 'Walt Whitman', from: 'Leaves of Grass' },
  { text: 'I loafe and invite my soul.', by: 'Walt Whitman', from: 'Leaves of Grass' },
  { text: 'Sleep that knits up the ravell\'d sleave of care.', by: 'William Shakespeare', from: 'Macbeth' },
  { text: 'The sun himself is weak when he first rises, and gathers strength and courage as the day gets on.', by: 'Charles Dickens', from: 'The Old Curiosity Shop' },
  { text: 'The journey of a thousand li commenced with a single step.', by: 'Lao Tzu, tr. James Legge', from: 'Tao Te Ching' },
  { text: 'Early to bed, and early to rise, makes a man healthy, wealthy, and wise.', by: 'Benjamin Franklin', from: 'The Way to Wealth' },
];

// One quote per day in a fixed order, so nothing repeats until every quote has shown, and the same
// author never comes up two days running (across the wrap-around too). The order is built once,
// deterministically: most-represented authors are placed first so they can always be spaced out.
const author = (i) => QUOTES[i].by.split(',')[0];

const ORDER = (() => {
  let seed = 20261015;
  const random = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
  const order = [];
  const left = QUOTES.map((_, i) => i);
  while (left.length) {
    const remaining = {};
    for (const i of left) remaining[author(i)] = (remaining[author(i)] ?? 0) + 1;
    const previous = order.length ? author(order.at(-1)) : null;
    const first = order.length ? author(order[0]) : null;
    const allowed = left.filter((i) => author(i) !== previous && (left.length > 1 || author(i) !== first));
    const [pick] = (allowed.length ? allowed : left)
      .map((i) => [i, remaining[author(i)] + random()])
      .sort((a, b) => b[1] - a[1])[0];
    order.push(pick);
    left.splice(left.indexOf(pick), 1);
  }
  return order;
})();

/** The quote for a day given as "YYYY-MM-DD". The same day gives the same quote in every timezone. */
export function quoteFor(day) {
  const [y, m, d] = day.split('-').map(Number);
  const daysSince1970 = Math.floor(Date.UTC(y, m - 1, d) / 864e5);
  return QUOTES[ORDER[daysSince1970 % QUOTES.length]];
}
