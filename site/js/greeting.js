// The words at the top. The headline greets by the clock; the line under the count combines the time
// of day with how far today's dailies are, so finishing early reads as something to notice (#23).
// The sun and the sky keep following progress.

/** "Good morning." and so on, from the hour (0–23). */
export function greeting(hour) {
  if (hour < 5) return 'Still up?';
  if (hour < 12) return 'Good morning.';
  if (hour < 17) return 'Good afternoon.';
  if (hour < 22) return 'Good evening.';
  return 'Good night.';
}

const LINES = {
  morning: { none: 'Fresh start.', some: 'Off to a good start.', all: 'All done before noon.' },
  afternoon: { none: 'Still plenty of day.', some: 'Keep going.', all: 'All done. Enjoy the afternoon.' },
  evening: { none: "A quiet day. That's ok.", some: 'Every one counts.', all: 'All done. Rest well.' },
};

const partOfDay = (hour) => (hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : 'evening');

/** The line under the count, from the hour and today's progress. Late night counts as evening. */
export function dayLine(hour, done, total) {
  const progress = total > 0 && done === total ? 'all' : done > 0 ? 'some' : 'none';
  return LINES[partOfDay(hour)][progress];
}
