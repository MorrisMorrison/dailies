// Your sky: every finished day lights a star, and the stars fill real constellations one after another.
// Each constellation takes as many finished days as it has stars.
//
// Positions are the real stars projected onto a 300×120 box (north up, east left, as seen looking up),
// listed in the order they light; `links` are the lines between them, by index. Line figures derived
// from d3-celestial © Olaf Frohn (BSD-3-Clause, see THIRD_PARTY.md); Orion trimmed to its classic eight.
export const CONSTELLATIONS = [
  { name: 'Cassiopeia', stars: [[72,12],[107,61],[152,57],[180,108],[228,69]], links: [[0,1],[1,2],[2,3],[3,4]] },
  { name: 'Big Dipper', stars: [[169,61],[235,12],[250,53],[195,86],[126,68],[91,71],[50,108]], links: [[0,1],[1,2],[2,3],[0,3],[0,4],[4,5],[5,6]] },
  { name: 'Orion', stars: [[143,70],[148,66],[153,62],[162,30],[150,12],[125,24],[134,108],[175,101]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[0,5],[0,6],[2,7]] },
  { name: 'Lyra', stars: [[160,40],[161,12],[181,23],[133,50],[119,108],[145,99]], links: [[0,1],[1,2],[0,2],[0,3],[3,4],[4,5],[0,5]] },
  { name: 'Cygnus', stars: [[108,97],[132,85],[151,63],[176,45],[183,19],[189,12],[139,44],[170,82],[192,108]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[2,6],[2,7],[7,8]] },
  { name: 'Crux', stars: [[117,54],[183,39],[159,108],[150,12]], links: [[0,1],[2,3]] },
  { name: 'Leo', stars: [[218,108],[218,76],[198,55],[112,49],[50,85],[110,83],[202,31],[238,12],[250,26]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[0,5],[2,6],[6,7],[7,8]] },
  { name: 'Corona Borealis', stars: [[195,12],[216,52],[190,96],[157,104],[130,108],[98,93],[84,38]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]] },
  { name: 'Delphinus', stars: [[182,108],[161,43],[151,16],[118,12],[133,33]], links: [[0,1],[1,2],[2,3],[3,4],[1,4]] },
  { name: 'Ursa Minor', stars: [[146,78],[136,88],[156,108],[165,94],[135,55],[138,31],[145,12]], links: [[0,1],[1,2],[2,3],[0,3],[0,4],[4,5],[5,6]] },
  { name: 'Aquila', stars: [[141,29],[135,38],[129,51],[109,87],[133,78],[167,67],[191,12],[191,108]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[1,6],[1,5],[5,7]] },
  { name: 'Gemini', stars: [[201,58],[192,59],[167,47],[137,21],[112,12],[99,31],[109,37],[126,62],[144,70],[176,90],[167,108],[127,90]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[7,11]] },
  { name: 'Canis Major', stars: [[187,44],[159,37],[137,74],[131,87],[139,95],[142,101],[186,108],[113,104],[145,39],[135,31],[148,12]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,7],[1,8],[8,9],[9,10],[8,10]] },
  { name: 'Scorpius', stars: [[196,39],[196,24],[192,12],[175,35],[167,39],[161,46],[149,70],[147,85],[146,103],[132,107],[113,108],[104,97],[107,92],[114,83]], links: [[0,1],[1,2],[1,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13]] },
  { name: 'Pegasus', stars: [[188,12],[163,24],[147,31],[96,21],[84,72],[145,76],[160,87],[165,91],[193,108],[216,94],[158,43],[161,47],[192,40],[210,37]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[2,5],[2,10],[10,11],[11,12],[12,13]] },
];

/** How many stars it takes to go through every constellation once. */
export const CYCLE = CONSTELLATIONS.reduce((sum, c) => sum + c.stars.length, 0);

/**
 * Where a number of finished days lands: the constellation being filled, how many of its stars are lit,
 * and how many constellations are complete. A finished constellation stays full until the next star.
 */
export function skyFor(finishedDays) {
  if (finishedDays === 0) return { constellation: CONSTELLATIONS[0], lit: 0, completed: 0 };
  let rest = ((finishedDays - 1) % CYCLE) + 1;
  let completed = Math.floor((finishedDays - 1) / CYCLE) * CONSTELLATIONS.length;
  for (const constellation of CONSTELLATIONS) {
    const size = constellation.stars.length;
    if (rest <= size) return { constellation, lit: rest, completed: completed + (rest === size ? 1 : 0) };
    rest -= size;
    completed++;
  }
}
