

// Define the drag behavior
const drag = simulation => {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};

// Include D3.js library in your HTML before using this script.

function createForceDirectedGraph(jsonUrl) {
  const width = 800;
  const height = 600;
  d3.json(jsonUrl).then(data => {
    const root = d3.hierarchy(data);
    const links = root.links();
    const nodes = root.descendants();

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(0).strength(1))
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line");

    const node = svg.append("g")
      .attr("fill", "#fff")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("fill", d => d.children ? null : "#000")
        .attr("stroke", d => d.children ? null : "#fff")
        .attr("r", 10)
        .call(drag(simulation));

    // Append text to nodes
    const nodeText = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text(d => d.data.name)
      .attr("font-size", d => Math.min(2 * d.r, (2 * d.r - 8) / d.data.name.length) + "px")
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .attr("fill", "#333")
      .style("pointer-events", "none"); // Disable pointer events on text

    node.append("title")
      .text(d => d.data.name);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      nodeText
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    document.getElementById('graph-container').appendChild(svg.node());
  }).catch(error => {
    console.error('Error loading JSON:', error);
  });
}


const jsonUrl = './data.json';
createForceDirectedGraph(jsonUrl);
