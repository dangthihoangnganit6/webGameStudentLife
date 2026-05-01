export const isPointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const parseRect = (x, y, w, h, angleDeg, cx, cy) => {
  const rad = angleDeg * (Math.PI / 180);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rotate = (px, py) => ({
    x: cx + (px - cx) * cos - (py - cy) * sin,
    y: cy + (px - cx) * sin + (py - cy) * cos
  });
  return [
    rotate(x, y),
    rotate(x + w, y),
    rotate(x + w, y + h),
    rotate(x, y + h)
  ];
};

export const OBSTACLE_POLYGONS = [
  [{x:191.27,y:240}, {x:270.77,y:291.5}, {x:388.77,y:366.5}, {x:296.27,y:416.5}, {x:223.27,y:376}, {x:198.52,y:353.75}, {x:149.645,y:322.625}, {x:99.27,y:291.5}],
  [{x:731.735,y:49}, {x:842.77,y:111}, {x:731.735,y:182.5}, {x:678.296,y:148}, {x:627.77,y:121}],
  [{x:286.27,y:305}, {x:462.27,y:213.5}, {x:508.27,y:247.5}, {x:533.77,y:267.5}, {x:351.77,y:369}],
  [{x:1187.77,y:124.5}, {x:1440.27,y:265.5}, {x:1187.77,y:411}, {x:921.77,y:255.5}],
  [{x:554.27,y:512.5}, {x:572.77,y:448}, {x:711.27,y:372.5}, {x:944.27,y:516}, {x:757.27,y:629.5}],
  [{x:1115.77,y:660}, {x:1294.27,y:769}, {x:1140.27,y:856.5}, {x:961.77,y:757}],
  [{x:1185.27,y:916}, {x:1321.27,y:828.5}, {x:1479.27,y:928}, {x:1341.27,y:1008}],
  [{x:309.27,y:817}, {x:465.27,y:722}, {x:539.27,y:765.5}, {x:382.77,y:858}],
  [{x:590.77,y:919}, {x:710.77,y:853}, {x:880.27,y:939.5}, {x:750.27,y:1017}],
  [{x:46.77,y:916}, {x:304.77,y:768}, {x:392.27,y:808}, {x:124.77,y:961}],
  [{x:289.365,y:849.5}, {x:338.77,y:837.5}, {x:285.27,y:930}, {x:248.77,y:915}],
  [{x:1315.77,y:524.5}, {x:1442.27,y:452.5}, {x:1442.27,y:549.5}, {x:1442.27,y:598}],
  [{x:1.76999,y:534}, {x:1.76999,y:487}, {x:79.77,y:534}, {x:1.76999,y:577}]
];

export const INTERACTION_POLYGONS = [
  { id: 'cantin', pts: [{x:623.27,y:892.5}, {x:758.635,y:949.237}, {x:706.127,y:1040.18}, {x:552.77,y:939.5}] },
  { id: 'parking', pts: parseRect(741.77, 562.79, 165.579, 74, -30, 741.77, 562.79) },
  { id: 'sell_transport_station', pts: parseRect(1024.81, 708.7, 116, 91.6224, 30, 1024.81, 708.7) },
  { id: 'student_house', pts: parseRect(1393.08, 463.796, 104.046, 98.631, 30, 1393.08, 463.796) },
  { id: 'work', pts: parseRect(718, 102.933, 87.8652, 77.1384, -30, 718, 102.933) },
  { id: 'parents_home', pts: parseRect(1272.94, 875.544, 131.552, 82.6615, 30, 1272.94, 875.544) },
  { id: 'parking', pts: [{x:615.77,y:472}, {x:719.82,y:532.073}, {x:650.27,y:641}, {x:548.77,y:584.5}] },
  { id: 'market', pts: parseRect(392.144, 776.016, 92.5861, 72.9416, -30, 392.144, 776.016) },
  { id: 'home', pts: parseRect(103, 927, 188, 50.8487, -30, 103, 927) },
  { id: 'school', pts: parseRect(1018.14, 211.567, 125.185, 135.103, 30, 1018.14, 211.567) },
  { id: 'hospital', pts: parseRect(343, 312.855, 144.45, 94.1648, -30, 343, 312.855) }
];
