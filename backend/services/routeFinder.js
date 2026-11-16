const fs = require("fs");
const path = require("path");

const rawData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/dhaka-city-local-bus.json"),
    "utf8",
  ),
);
const buses = rawData.data;

function buildGraph() {
  const graph = {};
  buses.forEach((bus) => {
    const route = bus.routes;
    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];
      if (!graph[from]) graph[from] = [];
      graph[from].push({ to, bus: bus.english, cost: 1 });
    }
    for (let i = route.length - 1; i > 0; i--) {
      const from = route[i];
      const to = route[i - 1];
      if (!graph[from]) graph[from] = [];
      graph[from].push({ to, bus: bus.english, cost: 1 });
    }
  });
  return graph;
}

const graph = buildGraph();

function findShortestPath(start, end) {
  if (!graph[start])
    return { message: "Start stop not found", path: [], legs: [] };
  if (!graph[end]) return { message: "End stop not found", path: [], legs: [] };

  const distances = {};
  const previous = {};
  const previousBus = {};
  const queue = new Set(Object.keys(graph));

  Object.keys(graph).forEach((node) => (distances[node] = Infinity));
  distances[start] = 0;

  while (queue.size > 0) {
    let current = null;
    let minDist = Infinity;
    queue.forEach((node) => {
      if (distances[node] < minDist) {
        minDist = distances[node];
        current = node;
      }
    });

    if (current === null || current === end) break;
    queue.delete(current);

    const neighbors = graph[current] || [];
    neighbors.forEach((edge) => {
      let penalty = 0;
      if (previousBus[current] && previousBus[current] !== edge.bus)
        penalty = 5;
      const newDist = distances[current] + edge.cost + penalty;
      if (newDist < distances[edge.to]) {
        distances[edge.to] = newDist;
        previous[edge.to] = current;
        previousBus[edge.to] = edge.bus;
        queue.add(edge.to);
      }
    });
  }

  if (distances[end] === Infinity) {
    return { message: "No route found", path: [], legs: [] };
  }

  const path = [];
  let step = end;
  while (step) {
    path.unshift(step);
    step = previous[step];
  }

  const legs = [];
  let currentBus = null;
  let legStart = path[0];
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = (graph[from] || []).find((e) => e.to === to);
    if (!edge) continue;
    if (currentBus === null) {
      currentBus = edge.bus;
    } else if (currentBus !== edge.bus) {
      legs.push({ bus: currentBus, from: legStart, to: from });
      currentBus = edge.bus;
      legStart = from;
    }
  }
  if (currentBus)
    legs.push({ bus: currentBus, from: legStart, to: path[path.length - 1] });

  return {
    totalStops: path.length - 1,
    path,
    legs,
    buses: [...new Set(legs.map((l) => l.bus))],
  };
}

module.exports = { findShortestPath, graph };
