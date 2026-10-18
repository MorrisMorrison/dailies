// The quote of the day, shown once all of today's dailies are done, from the collections chosen in Edit.
// Every line is public domain in both the US and the EU (authors and translators dead for over 70
// years, works published before 1931) and was checked word for word against its original text. They
// are chosen to fit the idea of dailies: getting outside, moving, rest, simplicity, the day itself,
// friendship, gratitude. Please keep to that when adding one.
// A "\n" is a line break in verse; "…" marks an omission. `sets` lists the collections a line is in.

/** The collections people can choose in Edit, with a few names that say what's in each. */
export const COLLECTIONS = [
  { id: 'classic', name: 'Classic', who: 'A bit of everything' },
  { id: 'nature', name: 'Nature', who: 'Thoreau, Emerson, Muir' },
  { id: 'stoics', name: 'Stoics', who: 'Marcus Aurelius, Epictetus, Seneca' },
  { id: 'poetry', name: 'Poetry', who: 'Dickinson, Wordsworth, Rossetti' },
  { id: 'stories', name: 'Storybooks', who: 'Anne of Green Gables, The Secret Garden' },
];
export const DEFAULT_COLLECTIONS = ['classic'];
export const isCollection = (id) => COLLECTIONS.some((c) => c.id === id);

const C = 'classic', N = 'nature', S = 'stoics', P = 'poetry', B = 'stories';

export const QUOTES = [
  // ---- Nature writers
  { text: 'Morning is when I am awake and there is a dawn in me.', by: 'Henry David Thoreau', from: 'Walden', sets: [C, N] },
  { text: 'Heaven is under our feet as well as over our heads.', by: 'Henry David Thoreau', from: 'Walden', sets: [C, N] },
  { text: 'Our life is frittered away by detail. … Simplicity, simplicity, simplicity!', by: 'Henry David Thoreau', from: 'Walden', sets: [C, N] },
  { text: 'I went to the woods because I wished to live deliberately.', by: 'Henry David Thoreau', from: 'Walden', sets: [C, N] },
  { text: 'Every morning was a cheerful invitation to make my life of equal simplicity, and I may say innocence, with Nature herself.', by: 'Henry David Thoreau', from: 'Walden', sets: [C, N] },
  { text: 'There is more day to dawn. The sun is but a morning star.', by: 'Henry David Thoreau', from: 'Walden', sets: [C, N] },
  { text: 'To affect the quality of the day, that is the highest of arts.', by: 'Henry David Thoreau', from: 'Walden', sets: [C, N] },
  { text: 'In Wildness is the preservation of the World.', by: 'Henry David Thoreau', from: 'Walking', sets: [C, N] },
  { text: 'The language of friendship is not words, but meanings.', by: 'Henry David Thoreau', from: 'A Week on the Concord and Merrimack Rivers', sets: [C] },
  { text: 'We need the tonic of wildness.', by: 'Henry David Thoreau', from: 'Walden', sets: [N] },
  { text: 'Only that day dawns to which we are awake.', by: 'Henry David Thoreau', from: 'Walden', sets: [N] },
  { text: 'I had three chairs in my house; one for solitude, two for friendship, three for society.', by: 'Henry David Thoreau', from: 'Walden', sets: [N] },
  { text: 'A lake is the landscape\'s most beautiful and expressive feature. It is earth\'s eye.', by: 'Henry David Thoreau', from: 'Walden', sets: [N] },
  { text: 'Let us spend one day as deliberately as Nature, and not be thrown off the track by every nutshell and mosquito\'s wing that falls on the rails.', by: 'Henry David Thoreau', from: 'Walden', sets: [N] },
  { text: 'I think that I cannot preserve my health and spirits, unless I spend four hours a day at least … sauntering through the woods and over the hills and fields.', by: 'Henry David Thoreau', from: 'Walking', sets: [N] },
  { text: 'Write it on your heart that every day is the best day in the year.', by: 'Ralph Waldo Emerson', from: 'Society and Solitude', sets: [C, N] },
  { text: 'Leave this military hurry and adopt the pace of Nature. Her secret is patience.', by: 'Ralph Waldo Emerson', from: 'Lectures and Biographical Sketches', sets: [C, N] },
  { text: 'The first wealth is health.', by: 'Ralph Waldo Emerson', from: 'The Conduct of Life', sets: [C] },
  { text: 'The only way to have a friend is to be one.', by: 'Ralph Waldo Emerson', from: 'Essays: First Series', sets: [C] },
  { text: 'The health of the eye seems to demand a horizon.', by: 'Ralph Waldo Emerson', from: 'Nature', sets: [C, N] },
  { text: 'To the body and mind which have been cramped by noxious work or company, nature is medicinal and restores their tone.', by: 'Ralph Waldo Emerson', from: 'Nature', sets: [C, N] },
  { text: 'In the woods, we return to reason and faith.', by: 'Ralph Waldo Emerson', from: 'Nature', sets: [C, N] },
  { text: 'To the attentive eye, each moment of the year has its own beauty.', by: 'Ralph Waldo Emerson', from: 'Nature', sets: [N] },
  { text: 'Nature always wears the colors of the spirit.', by: 'Ralph Waldo Emerson', from: 'Nature', sets: [N] },
  { text: 'Everybody needs beauty as well as bread, places to play in and pray in, where Nature may heal and cheer and give strength to body and soul alike.', by: 'John Muir', from: 'The Yosemite', sets: [C, N] },
  { text: 'In every walk with nature one receives far more than he seeks.', by: 'John Muir', from: 'Steep Trails', sets: [C, N] },
  { text: 'Another glorious Sierra day in which one seems to be dissolved and absorbed and sent pulsing onward we know not where.', by: 'John Muir', from: 'My First Summer in the Sierra', sets: [N] },

  // ---- Stoics
  { text: 'Life is long enough, if you know how to use it.', by: 'Seneca, tr. Aubrey Stewart', from: 'On the Shortness of Life', sets: [C, S] },
  { text: 'Make the best of your time, however short it may be.', by: 'Seneca, tr. Aubrey Stewart', from: 'On Benefits', sets: [C, S] },
  { text: 'He who receives a benefit with gratitude, repays the first instalment of it.', by: 'Seneca, tr. Aubrey Stewart', from: 'On Benefits', sets: [C, S] },
  { text: 'One\'s whole life must be spent in learning how to live.', by: 'Seneca, tr. Aubrey Stewart', from: 'On the Shortness of Life', sets: [C, S] },
  { text: 'We do not have a very short time assigned to us, but we lose a great deal of it.', by: 'Seneca, tr. Aubrey Stewart', from: 'On the Shortness of Life', sets: [S] },
  { text: 'The greatest remedy for anger is delay.', by: 'Seneca, tr. Aubrey Stewart', from: 'On Anger', sets: [S] },
  { text: 'In the morning when thou risest unwillingly, let this thought be present,—I am rising to the work of a human being.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [C, S] },
  { text: 'No longer talk at all about the kind of man that a good man ought to be, but be such.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [C, S] },
  { text: 'Think not so much of what thou hast not as of what thou hast.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [C, S] },
  { text: 'Very little indeed is necessary for living a happy life.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [C, S] },
  { text: 'Look within. Within is the fountain of good, and it will ever bubble up, if thou wilt ever dig.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [C, S] },
  { text: 'Do not act as if thou wert going to live ten thousand years.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [C, S] },
  { text: 'Nowhere either with more quiet or more freedom from trouble does a man retire than into his own soul.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [S] },
  { text: 'When thou wishest to delight thyself, think of the virtues of those who live with thee.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [S] },
  { text: 'Short is the little which remains to thee of life. Live as on a mountain.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [S] },
  { text: 'Be like the promontory against which the waves continually break, but it stands firm and tames the fury of the water around it.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [S] },
  { text: 'If it is not right, do not do it: if it is not true, do not say it.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [S] },
  { text: 'Look round at the courses of the stars, as if thou wert going along with them.', by: 'Marcus Aurelius, tr. George Long', from: 'Meditations', sets: [N] },
  { text: 'Every habit and faculty is maintained and increased by the corresponding actions: the habit of walking by walking, the habit of running by running.', by: 'Epictetus, tr. George Long', from: 'Discourses', sets: [C, S] },
  { text: 'If you would be a good reader, read; if a writer, write.', by: 'Epictetus, tr. George Long', from: 'Discourses', sets: [S] },
  { text: 'It is impossible for a man to begin to learn that which he thinks that he knows.', by: 'Epictetus, tr. George Long', from: 'Discourses', sets: [S] },
  { text: 'Men are disturbed not by the things which happen, but by the opinions about the things.', by: 'Epictetus, tr. George Long', from: 'Encheiridion', sets: [S] },
  { text: 'Seek not that the things which happen should happen as you wish; but wish the things which happen to be as they are, and you will have a tranquil flow of life.', by: 'Epictetus, tr. George Long', from: 'Encheiridion', sets: [S] },

  // ---- Poetry
  { text: 'Afoot and light-hearted I take to the open road,\nHealthy, free, the world before me.', by: 'Walt Whitman', from: 'Leaves of Grass', sets: [C, N, P] },
  { text: 'Now I see the secret of the making of the best persons,\nIt is to grow in the open air and to eat and sleep with the earth.', by: 'Walt Whitman', from: 'Leaves of Grass', sets: [C, N, P] },
  { text: 'I loafe and invite my soul.', by: 'Walt Whitman', from: 'Leaves of Grass', sets: [C, P] },
  { text: 'I believe a leaf of grass is no less than the journey work of the stars.', by: 'Walt Whitman', from: 'Leaves of Grass', sets: [P] },
  { text: 'Henceforth I ask not good-fortune, I myself am good-fortune.', by: 'Walt Whitman', from: 'Leaves of Grass', sets: [P] },
  { text: 'Sleep that knits up the ravell\'d sleave of care.', by: 'William Shakespeare', from: 'Macbeth', sets: [C, P] },
  { text: 'Hope is the thing with feathers\nThat perches in the soul.', by: 'Emily Dickinson', from: 'Poems', sets: [P] },
  { text: 'If I can stop one heart from breaking,\nI shall not live in vain.', by: 'Emily Dickinson', from: 'Poems', sets: [P] },
  { text: 'To make a prairie it takes a clover and one bee.', by: 'Emily Dickinson', from: 'Poems', sets: [P] },
  { text: 'I\'ll tell you how the sun rose, —\nA ribbon at a time.', by: 'Emily Dickinson', from: 'Poems', sets: [P] },
  { text: 'Water is taught by thirst.', by: 'Emily Dickinson', from: 'Poems', sets: [P] },
  { text: 'I\'m nobody! Who are you?\nAre you nobody, too?', by: 'Emily Dickinson', from: 'Poems', sets: [P] },
  { text: 'Some keep the Sabbath going to church;\nI keep it staying at home,\nWith a bobolink for a chorister,\nAnd an orchard for a dome.', by: 'Emily Dickinson', from: 'Poems', sets: [N, P] },
  { text: 'The brain is wider than the sky.', by: 'Emily Dickinson', from: 'Poems', sets: [P] },
  { text: 'Come forth into the light of things,\nLet Nature be your teacher.', by: 'William Wordsworth', from: 'The Tables Turned', sets: [N, P] },
  { text: 'Up! up! my Friend, and quit your books,\nOr surely you\'ll grow double.', by: 'William Wordsworth', from: 'The Tables Turned', sets: [P] },
  { text: 'I heard a thousand blended notes,\nWhile in a grove I sate reclined.', by: 'William Wordsworth', from: 'Lines Written in Early Spring', sets: [N, P] },
  { text: 'One moment now may give us more\nThan fifty years of reason.', by: 'William Wordsworth', from: 'To My Sister', sets: [P] },
  { text: 'It is the first mild day of March:\nEach minute sweeter than before.', by: 'William Wordsworth', from: 'To My Sister', sets: [N, P] },
  { text: 'Life has loveliness to sell,\nAll beautiful and splendid things.', by: 'Sara Teasdale', from: 'Barter', sets: [P] },
  { text: 'Spend all you have for loveliness,\nBuy it and never count the cost.', by: 'Sara Teasdale', from: 'Barter', sets: [P] },
  { text: 'Into my heart\'s treasury\nI slipped a coin\nThat time cannot take\nNor a thief purloin.', by: 'Sara Teasdale', from: 'The Coin', sets: [P] },
  { text: 'Who has seen the wind?\nNeither I nor you:\nBut when the leaves hang trembling\nThe wind is passing thro\'.', by: 'Christina Rossetti', from: 'Sing-Song', sets: [N, P] },
  { text: 'Long live the weeds and the wilderness yet.', by: 'Gerard Manley Hopkins', from: 'Inversnaid', sets: [N, P] },
  { text: 'Nothing is so beautiful as Spring.', by: 'Gerard Manley Hopkins', from: 'Spring', sets: [P] },
  { text: 'The world is so full of a number of things,\nI\'m sure we should all be as happy as kings.', by: 'Robert Louis Stevenson', from: 'A Child\'s Garden of Verses', sets: [P] },
  { text: 'How do you like to go up in a swing,\nUp in the air so blue?', by: 'Robert Louis Stevenson', from: 'A Child\'s Garden of Verses', sets: [P] },
  { text: 'The rain is raining all around,\nIt falls on field and tree.', by: 'Robert Louis Stevenson', from: 'A Child\'s Garden of Verses', sets: [P] },
  { text: 'Season of mists and mellow fruitfulness,\nClose bosom-friend of the maturing sun.', by: 'John Keats', from: 'To Autumn', sets: [P] },
  { text: 'The Sun does arise,\nAnd make happy the skies.', by: 'William Blake', from: 'The Echoing Green', sets: [P] },

  // ---- Storybooks
  { text: 'The sun himself is weak when he first rises, and gathers strength and courage as the day gets on.', by: 'Charles Dickens', from: 'The Old Curiosity Shop', sets: [C, B] },
  { text: 'Isn\'t it nice to think that tomorrow is a new day with no mistakes in it yet?', by: 'L. M. Montgomery', from: 'Anne of Green Gables', sets: [B] },
  { text: 'Kindred spirits are not so scarce as I used to think.', by: 'L. M. Montgomery', from: 'Anne of Green Gables', sets: [B] },
  { text: 'I\'m so glad I live in a world where there are Octobers.', by: 'L. M. Montgomery', from: 'Anne of Green Gables', sets: [B] },
  { text: 'You can nearly always enjoy things if you make up your mind firmly that you will.', by: 'L. M. Montgomery', from: 'Anne of Green Gables', sets: [B] },
  { text: 'Dear old world … you are very lovely, and I am glad to be alive in you.', by: 'L. M. Montgomery', from: 'Anne of Green Gables', sets: [B] },
  { text: 'Where you tend a rose, my lad, a thistle cannot grow.', by: 'Frances Hodgson Burnett', from: 'The Secret Garden', sets: [B] },
  { text: 'The sun is shining—the sun is shining. That is the Magic.', by: 'Frances Hodgson Burnett', from: 'The Secret Garden', sets: [B] },
  { text: 'I am sure there is Magic in everything, only we have not sense enough to get hold of it and make it do things for us.', by: 'Frances Hodgson Burnett', from: 'The Secret Garden', sets: [B] },
  { text: 'When you\'re hunting for the glad things, you sort of forget the other kind.', by: 'Eleanor H. Porter', from: 'Pollyanna', sets: [B] },
  { text: 'The game was to just find something about everything to be glad about.', by: 'Eleanor H. Porter', from: 'Pollyanna', sets: [B] },
  { text: 'What men and women need is encouragement.', by: 'Eleanor H. Porter', from: 'Pollyanna', sets: [B] },
  { text: 'There is nothing—absolute nothing—half so much worth doing as simply messing about in boats.', by: 'Kenneth Grahame', from: 'The Wind in the Willows', sets: [B] },
  { text: 'The Mole had been working very hard all the morning, spring-cleaning his little home.', by: 'Kenneth Grahame', from: 'The Wind in the Willows', sets: [B] },
  { text: 'Beyond the Wild Wood comes the Wide World.', by: 'Kenneth Grahame', from: 'The Wind in the Willows', sets: [B] },
  { text: 'I\'m not afraid of storms, for I\'m learning how to sail my ship.', by: 'Louisa May Alcott', from: 'Little Women', sets: [B] },
  { text: 'Love is a great beautifier.', by: 'Louisa May Alcott', from: 'Little Women', sets: [B] },
  { text: 'I like good strong words that mean something.', by: 'Louisa May Alcott', from: 'Little Women', sets: [B] },
  { text: 'You just think lovely wonderful thoughts … and they lift you up in the air.', by: 'J. M. Barrie', from: 'Peter Pan', sets: [B] },
  { text: 'When a child loves you for a long, long time, not just to play with, but really loves you, then you become Real.', by: 'Margery Williams', from: 'The Velveteen Rabbit', sets: [B] },
  { text: 'Why, sometimes I\'ve believed as many as six impossible things before breakfast.', by: 'Lewis Carroll', from: 'Through the Looking-Glass', sets: [B] },
  { text: 'It takes all the running you can do, to keep in the same place.', by: 'Lewis Carroll', from: 'Through the Looking-Glass', sets: [B] },
  { text: 'There is no place like home.', by: 'L. Frank Baum', from: 'The Wonderful Wizard of Oz', sets: [B] },

  // ---- Others in Classic
  { text: 'Early to bed, and early to rise, makes a man healthy, wealthy, and wise.', by: 'Benjamin Franklin', from: 'The Way to Wealth', sets: [C] },
  { text: 'The journey of a thousand li commenced with a single step.', by: 'Lao Tzu, tr. James Legge', from: 'Tao Te Ching', sets: [C] },
];

// One quote per day in a fixed order per choice of collections, so nothing repeats until every quote in
// the choice has shown, and the same author never comes up two days running (across the wrap-around
// too). Each order is built once, deterministically: most-represented authors are placed first so
// they can always be spaced out.
const author = (i) => QUOTES[i].by.split(',')[0];

function buildOrder(pool) {
  let seed = 20261015;
  const random = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
  const order = [];
  const left = [...pool];
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
  // If the last quote shares its author with the first, the wrap-around would repeat them: move it
  // to a place between two other authors.
  const last = order.at(-1);
  if (order.length > 2 && author(last) === author(order[0])) {
    const at = order.findIndex((q, i) => i > 0 && i < order.length - 1 && author(order[i - 1]) !== author(last) && author(q) !== author(last));
    if (at > 0) order.splice(at, 0, order.pop());
  }
  return order;
}

const orders = new Map();

/** The quotes in any of these collections (Classic when none is known), in their daily order. */
export function quotesIn(collections = DEFAULT_COLLECTIONS) {
  const chosen = collections.filter(isCollection);
  const sets = chosen.length ? chosen : DEFAULT_COLLECTIONS;
  const key = COLLECTIONS.map((c) => c.id).filter((id) => sets.includes(id)).join();
  if (!orders.has(key)) {
    const pool = QUOTES.map((_, i) => i).filter((i) => QUOTES[i].sets.some((s) => sets.includes(s)));
    orders.set(key, buildOrder(pool).map((i) => QUOTES[i]));
  }
  return orders.get(key);
}

/** The quote for a day given as "YYYY-MM-DD". The same day gives the same quote in every timezone. */
export function quoteFor(day, collections = DEFAULT_COLLECTIONS) {
  const [y, m, d] = day.split('-').map(Number);
  const daysSince1970 = Math.floor(Date.UTC(y, m - 1, d) / 864e5);
  const order = quotesIn(collections);
  return order[daysSince1970 % order.length];
}
