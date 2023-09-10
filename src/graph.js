/**
 * Filename: graph.js
 * Description: Draws an interactive graph using D3.js
 * Author: Mohammad Zafar
 * Date: 09/10/2023
 */

/***** DRAG FUNCTIONALITY *****/
// defines the drag simulation for nodes
const drag = (simulation) => {
  /**
   * Initiates the start of the drag
   *
   * @param {*} event - Drag trigger for node
   * @param {*} d - The element being dragged
   */
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    console.log(event);
  }

  /**
   * Updates the node to follow the user pointer
   *
   * @param {*} event - Drag trigger for node
   * @param {*} d - The element being dragged
   */
  function dragged(event, d) {
    d.fx = d.x + event.dx;
    d.fy = d.y + event.dy;

    // make sure link stays connected to the node
    link
      .filter((linkData) => linkData.source === d || linkData.target === d)
      .attr("x1", (linkData) => linkData.source.x)
      .attr("y1", (linkData) => linkData.source.y)
      .attr("x2", (linkData) => linkData.target.x)
      .attr("y2", (linkData) => linkData.target.y);
  }

  /**
   * Ceases input from user and lets D3 simulation regain control
   *
   * @param {*} event - Drag trigger for node
   * @param {*} d - The element being dragged
   */

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

/**
 * Responsible for creating and appending a force directed graph to DOM using D3js
 *
 * @param {*} jsonUrl - Path to hierarchal data in JSON format
 */
function createForceDirectedGraph(jsonUrl) {
  /**
   * Dynamically resizes the svg when window dimensions are changed
   */
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

  /***** CREATING MAIN PARENT SVG *****/
  const width = 5000;
  const height = 5000;
  // modify this value to change the zoom scale
  const initialZoomScale = 5; // HACK: should be based on the size of the graph

  const svg = d3
    .create("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("id", "graph")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const container = svg.append("g");

  /***** Centered X and Y Graph (FOR DEBUGGING PURPOSES) *****/
  container
    .append("line")
    .attr("x1", 0)
    .attr("y1", height / 2)
    .attr("x2", width)
    .attr("y2", height / 2)
    .attr("stroke", "gray")
    .attr("stroke-width", 5)
    .attr("stroke-dasharray", "4,4");

  container
    .append("line")
    .attr("x1", width / 2)
    .attr("y1", 0)
    .attr("x2", width / 2)
    .attr("y2", height)
    .attr("stroke", "gray")
    .attr("stroke-width", 5)
    .attr("stroke-dasharray", "4,4");

  /***** ZOOM BEHAVIOR *****/

  // DEPRECATED: Apply the initial zoom transform to the container <g> element
  // const initialTranslateX = (width / 2) * (1 - initialZoomScale);
  // const initialTranslateY = (height / 2) * (1 - initialZoomScale);
  // container.attr(
  //   "transform",
  //   `translate(${initialTranslateX}, ${initialTranslateY}) scale(${initialZoomScale})`
  // );

  // DEFINING ZOOM
  const zoom = d3
    .zoom()
    .extent([
      [0, 0],
      [width, height],
    ])
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

  svg.call(zoom);

  zoom.scaleBy(svg, initialZoomScale);

  function zoomed(event) {
    container.attr("transform", event.transform);
  }

  /***** GENERATING ARROWHEADS FOR LINKS *****/
  const markerColors = {
    red: "red",
    blue: "blue",
    green: "green",
    // Add more colors if needed
  };

  // Generate arrowheads based on colors from markerColours
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
      // const root = d3.hierarchy(data);
      // const links = root.links();
      // const nodes = root.descendants();

      const nodes = data.nodes;
      const links = data.links;

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.code)
            .distance(0)
            .strength(1)
        )
        .force("charge", d3.forceManyBody().strength(-2000)) // Increase charge for more spacing
        .force("x", d3.forceX(width / 2).strength(0.1)) // HACK: pushes out of corner
        .force("y", d3.forceY(height / 2).strength(0.1)) // HACK: pushes out of corner
        .force("collision", d3.forceCollide().radius(15)); // Prevent node overlap

      // Create a copy of your original links array with reversed source and target
      const reversedLinks = links.map((link) => ({
        source: link.target, // Reverse source and target
        target: link.source,
        linkColor: link.linkColor, // Keep other properties intact
      }));

      // Add the reversedLinks to the original links array
      const allLinks = [...reversedLinks];

      // container that stores all links between nodes and their properties
      link = container // HACK: should be declared locally but dragged function can't access properly
        .append("g")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(allLinks)
        .join("line")
        .attr("stroke-width", 2)
        .attr("stroke", (d) => d.source.linkColor || "#999") // Set the link color based on the source node's linkColor property
        .attr("stroke-dasharray", "4,4") // Set the stroke-dasharray to create dotted lines
        .attr("marker-end", (d) => {
          // Dynamically set the marker-end based on linkColor property
          console.log(d.source.linkColor);
          return `url(#${d.source.linkColor || "default"}-marker)`;
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
        .attr("fill", (d) =>
          d.completed ? "green" : d.children ? null : "#000"
        )
        .attr("r", 15) // Increase node radius for more spacing
        .attr("class", "node")
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
        .text((d) => d.code)
        .attr(
          "font-size",
          (d) => Math.min(2 * d.r, (2 * d.r - 8) / d.code.length) + "px"
        )
        .attr("dy", "2em") // Adjust vertical position of text
        .style("text-anchor", "middle")
        .attr("fill", "#333")
        .style("pointer-events", "none");

      // appending node's name to respective node
      node.append("title").text((d) => d.code);

      /***** GRAPH SIMULATION *****/
      // update the link, node, and text pos every tick
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

  /***** POPUP ELEMENT *****/
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
  popup.append("button").text("Mark as Completed").on("click", toggleCompletedStatus(d));

  /**
   * Grabs name, description, and prereqs from clicked node
   * and displays information in popup
   * 
   * @param {*} event 
   * @param {*} d 
   */
  function showNodeInfo(event, d) {
  
    //grabbing information from node
    const nameInfo = d.code;
    const titleInfo = d.name;
    const descInfo = JSON.stringify(d.description, null, 2);
    const prereqInfo = JSON.stringify(d.prerequisites, null, 2);

    // display the name of the node
    nameInfoElement.text(nameInfo + ": " + titleInfo);

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

  // Function to toggle the "completed" status of a node
  function toggleCompletedStatus(d) {
    d.completed = !d.completed; // Toggle the completed property
    // Update the node's fill color based on the completed status
    node.attr("fill", (d) =>
      d.completed ? "green" : d.children ? null : "#000"
    );
  }

  /**
   * Hides the popup when "close" button is pressed */ 
  function closePopup() {
    popup.style("display", "none");
  }

  // Function to toggle the completion status of a node
  function toggleCompletedStatus(node) {
    node.completed = !node.completed;

    // Update the node's color based on completion status
    node.color = node.completed ? "green" : node.linkColor || "blue";

    // Update the node's color in the visualization
    container
      .selectAll(".node")
      .filter((d) => d.code === node.code)
      .attr("fill", (d) => d.color);
  }

  // Attach click event handler to the "Mark as Completed" button
  container.selectAll(".mark-completed").on("click", function () {
    // Get the node associated with the currently opened popup
    const currentNode = d3.select(this.parentNode).datum();
    toggleCompletedStatus(currentNode);

    // Close the popup (you may have your own logic for this)
    closePopup();

    // You can also update the button text based on completion status
    d3.select(this).text(
      currentNode.completed ? "Mark as Incomplete" : "Mark as Completed"
    );
  });

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

  /**
   * Labels popup as "active" and allows for window dragging
   *
   * @param {*} event - drag trigger for popup
   */

  function dragstarted(event) {
    d3.select(this).raise().classed("active", true);
  }

  /**
   * Left and Top corners of popup follow the pointer on drag
   *
   * @param {*} event - drag trigger for popup
   */
  function dragged(event) {
    d3.select(this)
      .style(
        "left",
        parseFloat(d3.select(this).style("left")) + event.dx + "px"
      )
      .style("top", parseFloat(d3.select(this).style("top")) + event.dy + "px");
  }

  /**
   * Disables dragging by removing the "active" class
   *
   * @param {*} event - drag trigger for popup
   */
  function dragended(event) {
    d3.select(this).classed("active", false);
  }
}

// CHANGE THIS WITH THE APPROPRIATE JSON FILE
const jsonUrl = "./final.json";

// Allows the magic to happen :)
createForceDirectedGraph(jsonUrl);
