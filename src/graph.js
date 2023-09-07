// Define the drag behavior
const drag = (simulation) => {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = d.x + event.dx;
    d.fy = d.y + event.dy;

    // Update the link coordinates to stay connected with the node
    link
      .filter((linkData) => linkData.source === d || linkData.target === d)
      .attr("x1", (linkData) => linkData.source.x)
      .attr("y1", (linkData) => linkData.source.y)
      .attr("x2", (linkData) => linkData.target.x)
      .attr("y2", (linkData) => linkData.target.y);
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

function createForceDirectedGraph(jsonUrl) {
  // Define a function to handle resizing
  function handleResize() {
    // Get the current dimensions of the parent container
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update the SVG dimensions
    svg.attr("width", width).attr("height", height);

    // Update the zoom extent
    zoom.extent([
      [0, 0],
      [width, height],
    ]);
  }

  // Attach an event listener to the window's resize event
  window.addEventListener("resize", handleResize);

  const width = 5000;
  const height = 5000;

  const svg = d3
    .create("svg")
    .attr("width", "100%") // Set initial width to 100% of the parent container
    .attr("height", "100%") // Set initial height to 100% of the parent container
    .attr("id", "graph")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const container = svg.append("g");

  container
    .append("line")
    .attr("x1", 0)
    .attr("y1", height / 2)
    .attr("x2", width)
    .attr("y2", height / 2)
    .attr("stroke", "gray")
    .attr("stroke-width", 5)
    .attr("stroke-dasharray", "4,4");

  // Add vertical line
  container
    .append("line")
    .attr("x1", width / 2)
    .attr("y1", 0)
    .attr("x2", width / 2)
    .attr("y2", height)
    .attr("stroke", "gray")
    .attr("stroke-width", 5)
    .attr("stroke-dasharray", "4,4");
  function zoomed(event) {
    container.attr("transform", event.transform);
  }

  const zoom = d3
    .zoom()
    .extent([
      [0, 0],
      [width, height],
    ])
    .scaleExtent([0, 0])
    .on("zoom", zoomed);

  svg.call(zoom);

  // Create a popup element
  const popup = d3
    .select("body")
    .append("div")
    .attr("id", "node-popup")
    .style("display", "none")
    .style("position", "absolute")
    .style("background-color", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.2)");

  // popup.append("h2").text("Node Information");

  // append name of popup
  const nameInfoElement = popup
    .append("h2")
    .attr("id", "node-info")
    .style("font-family", "monospace")
    .style("white-space", "pre-wrap");

  const descInfoElement = popup
    .append("pre")
    .attr("id", "node-info")
    .style("font-family", "monospace")
    .style("white-space", "pre-wrap");

  const prereqInfoElement = popup
    .append("pre")
    .attr("id", "node-info")
    .style("font-family", "monospace")
    .style("white-space", "pre-wrap");

  popup.append("button").text("Close").on("click", closePopup);

  const markerColors = {
    red: "red",
    blue: "blue",
    green: "green",
    // Add more colors as needed
  };

  // Create markers dynamically based on markerColors
  for (const color in markerColors) {
    svg
      .append("defs")
      .append("marker")
      .attr("id", color + "-marker")
      .attr("viewBox", "0 -3 6 6")
      .attr("refX", 17)
      .attr("refY", 0)
      .attr("markerWidth", 4)
      .attr("markerHeight", 4)
      .attr("orient", "auto")
      .attr("fill", markerColors[color])
      .append("path")
      .attr("d", "M0,-3L6,0L0,3");
  }

  d3.json(jsonUrl)
    .then((data) => {
      const root = d3.hierarchy(data);
      const links = root.links();
      const nodes = root.descendants();

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(0)
            .strength(1)
        )
        .force("charge", d3.forceManyBody().strength(-2000)) // Increase charge for more spacing
        .force("x", d3.forceX(width / 2).strength(0.1)) // HACK: pushes out of corner
        .force("y", d3.forceY(height / 2).strength(0.1)) // HACK: pushes out of corner
        .force("collision", d3.forceCollide().radius(15)); // Prevent node overlap

      // container that stores all links between nodes and their properties
      const link = container
        .append("g")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 2) // Adjust the stroke width as needed
        .attr("stroke", (d) => d.target.data.linkColor || "#999") // Set the link color based on the source node's linkColor property
        .attr("stroke-dasharray", "4,4") // Set the stroke-dasharray to create dotted lines
        .attr("marker-end", (d) => {
          // Dynamically set the marker-end based on linkColor property
          console.log(d.target.data.linkColor);
          return `url(#${d.target.data.linkColor || "default"}-marker)`;
        });

      // container that stores all nodes and their properties
      const node = container
        .append("g")
        .attr("fill", "#fff")
        .attr("stroke", "#000")
        .attr("stroke-width", 2)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("fill", (d) => (d.children ? null : "#000"))
        .attr("r", 15) // Increase node radius for more spacing
        .call(drag(simulation))
        .on("click", (event, d) => showNodeInfo(event, d))
        .on("mouseover", () => node.style("cursor", "pointer"))
        .on("mouseout", () => node.style("cursor", "default"));

      // stores all texts displayed for nodes
      const nodeText = container
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .text((d) => d.data.code)
        .attr(
          "font-size",
          (d) => Math.min(2 * d.r, (2 * d.r - 8) / d.data.code.length) + "px"
        )
        .attr("dy", "2em") // Adjust vertical position of text
        .style("text-anchor", "middle")
        .attr("fill", "#333")
        .style("pointer-events", "none");

      // appending node's name to respective node
      node.append("title").text((d) => d.data.code);

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        nodeText.attr("x", (d) => d.x).attr("y", (d) => d.y);
        node
          .attr("cx", (d) => {
            return (d.x = Math.max(15, Math.min(width - 15, d.x)));
          })
          .attr("cy", (d) => {
            return (d.y = Math.max(15, Math.min(height - 15, d.y)));
          });
      });

      // append graph to DOM (graph-container)
      document.getElementById("graph-container").appendChild(svg.node());

      // Call handleResize initially to set the SVG dimensions
      handleResize();
    })
    .catch((error) => {
      console.error("Error loading JSON:", error);
    });

  // Function to show node information (popup)
  function showNodeInfo(event, d) {
    // grab the name, description, and prerequisites of the clicked node
    // const nameInfo = JSON.stringify(d.data.name, null, 2);
    const nameInfo = d.data.code;
    const descInfo = JSON.stringify(d.data.additionalInfo, null, 2);
    const prereqInfo = JSON.stringify(d.data.prerequisites, null, 2);

    // display the name of the node
    nameInfoElement.text(nameInfo);

    // display the description stored
    if (descInfo == null) {
      descInfoElement.text("Description: none");
    } else {
      descInfoElement.text("Description: " + descInfo);
    }

    // display prerequisites if any
    if (prereqInfo == null) {
      prereqInfoElement.text("Prerequisites: none");
    } else {
      prereqInfoElement.text("Prerequisites: " + prereqInfo);
    }

    // Position the popup near mouse click
    popup
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY + 10 + "px");

    // Show the popup
    popup.style("display", "block");
  }

  // function to close popup
  function closePopup() {
    popup.style("display", "none");
  }

  // Define the drag behavior for the popup
  const dragPopup = d3
    .drag()
    .subject(() => ({
      x: parseFloat(popup.style("left")),
      y: parseFloat(popup.style("top")),
    }))
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  // Attach the drag behavior to the popup element
  popup.call(dragPopup);

  // Function to handle the start of dragging the popup
  function dragstarted(event) {
    d3.select(this).raise().classed("active", true);
  }

  // Function to handle dragging the popup
  function dragged(event) {
    d3.select(this)
      .style(
        "left",
        parseFloat(d3.select(this).style("left")) + event.dx + "px"
      )
      .style("top", parseFloat(d3.select(this).style("top")) + event.dy + "px");
  }

  // Function to handle the end of dragging the popup
  function dragended(event) {
    d3.select(this).classed("active", false);
  }
}

const jsonUrl = "./classes.json";
createForceDirectedGraph(jsonUrl);
