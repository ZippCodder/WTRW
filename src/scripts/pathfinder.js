 function euclideanDistance(x1, y1, x2, y2) {
     return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
 }

 function manhattanDistance(x1, y1, x2, y2) {
     return (Math.abs(x1 - x2) + Math.abs(y1 - y2));
 }

 function getPath(s, g) {

     let $NODES = $GRAPHS[this.mapId];

     const start = s,
         goal = g,
         open = [s],
         closed = [];
     let current, result = {
         result: false,
         path: []
     };

     while (open.length > 0) {

         current = open.reduce((a, v) => {
             return (($NODES[v].f < a.f || ($NODES[v].f === a.f && $NODES[v].h < a.h)) ? $NODES[v] : a)
         }, {
             f: Infinity,
             h: Infinity
         });

         open.splice(open.indexOf(current.id), 1);
         closed.push(current.id);

         if (current.id === goal) {
             let n = current;

             while (n.id !== start) {
                 n = $NODES[n.parent];
                 if (n.id === start) break;
                 result.path.unshift(n.position);
             }

             result.path.push(current.position);
             result.result = true;
             break;
         }

         for (let i of current.edges) {
             let edge = $NODES[i];

             if (edge === undefined) continue;

             let calc = {
                 g: current.g + euclideanDistance(edge.position.x, edge.position.y, current.position.x, current.position.y),
                 h: manhattanDistance(edge.position.x, edge.position.y, $NODES[goal].position.x, $NODES[goal].position.y)
             };
             calc.f = calc.g + calc.h;

             if ((this.blocked.includes(edge.id) || closed.includes(edge.id)) && edge.id !== goal) continue;
             if (edge.parent === undefined || edge.fresh === true || calc.f < edge.f) {
                 edge.parent = current.id;
                 edge.f = calc.f;
                 edge.g = calc.g;
                 edge.h = calc.h;
                 if (!open.includes(edge.id)) open.push(edge.id);
             }
         }

         current.f = 0;
         current.h = 0;
         current.g = 0;
         current.fresh = true;
     }

     return result;
 }

 let $GRAPHS = {};

 self.onmessage = function({
     data
 }) {
     switch (data.requestType) {
         case 0: {
             postMessage({
                 result: getPath.call(data, data.path.start, data.path.end),
                 mapId: data.mapId,
                 avatarId: data.avatarId
             });
         };
         break;
         case 1: {
             $GRAPHS[data.mapId] = data.nodes;
         };
         break;
     }
 }