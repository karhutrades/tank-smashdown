/* ---------------- maps ----------------
 tiles: '#'block 'x'crate '~'liquid '.'floor 'b'bush '*'ice
        '>' '<' '^' 'v' conveyor  'o'bumper  '1''2'portal pairs
        'R''L''U''D' one-way gates (pass only in arrow direction) */
/* Arenas are generated at runtime (see the procedural generator below).
   MAPS starts with one bootstrap arena so early draw calls always have a map. */
const MAPS=[
{name:'PROVING GROUND',world:'meadow',floorA:'#6fbf49',floorB:'#63b03f',block:'#b5763a',blockTop:'#d99a55',
 liqA:'#3fa7d6',liqB:'#7fd0f0',decal:'flowers',
 spawns:[[2,7,0],[21,7,Math.PI]],grid:[
'########################',
'#......................#',
'#..##..............##..#',
'#......................#',
'#......................#',
'#.....x....##....x.....#',
'#........######........#',
'#........######........#',
'#........######........#',
'#.....x....##....x.....#',
'#......................#',
'#......................#',
'#..##..............##..#',
'#......................#',
'########################']}
];
const AMBIENT={meadow:'clouds',desert:'heat',frost:'snow',volcano:'embers',factory:'sparks',stadium:'clouds'};
