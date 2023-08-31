

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

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;")
    .call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.1, 4])
      .on("zoom", zoomed));

  const container = svg.append("g");

  function zoomed(event) {
    container.attr("transform", event.transform);
  }

  d3.json(jsonUrl).then(data => {
    const root = d3.hierarchy(data);
    const links = root.links();
    const nodes = root.descendants();

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(0).strength(1))
      .force("charge", d3.forceManyBody().strength(-2000)) // Increase charge for more spacing
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    const link = container.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2); // Adjust the stroke width as needed

    const node = container.append("g")
      .attr("fill", "#fff")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("fill", d => d.children ? null : "#000")
      .attr("stroke", d => d.children ? null : "#fff")
      .attr("r", 15) // Increase node radius for more spacing
      .call(drag(simulation));

    const nodeText = container.selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text(d => d.data.name)
      .attr("font-size", d => Math.min(2 * d.r, (2 * d.r - 8) / d.data.name.length) + "px")
      .attr("dy", "2em") // Adjust vertical position of text
      .style("text-anchor", "middle")
      .attr("fill", "#333")
      .style("pointer-events", "none");

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


const jsonUrl = './program.json';
createForceDirectedGraph(jsonUrl);
