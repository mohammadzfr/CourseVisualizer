/**
 * Filename: graph.js
 * Description: Draws an force-directed graph designed to display courses using D3.js
 * Author: Mohammad Zafar
 * References: Mike Bostock: https://observablehq.com/@d3/force-directed-tree?intent=fork
 *             D3 Team: https://observablehq.com/@d3/disjoint-force-directed-graph/2?intent=fork
 *             D3 Team: https://observablehq.com/@d3/force-directed-graph/2?intent=fork
 * Date: 09/10/2023
 */

const colorPalette = {
  nodeColors: {
    blue: "#3498db",
    green: "#2ecc71",
    red: "#e74c3c",
    yellow: "#f1c40f",
    purple: "#9b59b6",
    orange: "#e67e22",
    teal: "#1abc9c",
    gray: "#95a5a6",
    darkBlue: "#2980b9",
    darkGreen: "#27ae60",
    darkRed: "#c0392b",
    darkYellow: "#f39c12",
    darkPurple: "#8e44ad",
    darkOrange: "#d35400",
    darkTeal: "#16a085",
    darkGray: "#7f8c8d",
  },
  linkColors: {
    normal: "#95a5a6",
    highlighted: "#3498db",
    completed: "#2ecc71",
  },
};

// Example usage:
const nodeColor = colorPalette.nodeColors.blue;
const linkColor = colorPalette.linkColors.normal;

/***** DRAG FUNCTIONALITY *****/
// defines the drag simulation for nodes
const drag = (simulation) => {
  /**
   * Initiates the start of the drag
   *
   * @param {*} dragEvent - Drag trigger for node
   * @param {*} nodeData - The element being dragged
   */
  function dragstarted(dragEvent, nodeData) {
    if (!dragEvent.active) simulation.alphaTarget(0.3).restart();
    nodeData.fx = nodeData.x;
    nodeData.fy = nodeData.y;
    // console.log(dragEvent);
  }

  /**
   * Updates the node to follow the user pointer
   *
   * @param {*} dragEvent - Drag trigger for node
   * @param {*} nodeData - The element being dragged
   */
  function dragged(dragEvent, nodeData) {
    nodeData.fx = nodeData.x + dragEvent.dx;
    nodeData.fy = nodeData.y + dragEvent.dy;

    // Makes sure the link stays connected to the node and not the cursor
    link
      .filter(
        (linkData) =>
          linkData.source === nodeData || linkData.target === nodeData
      )
      .attr("x1", (linkData) => linkData.source.x)
      .attr("y1", (linkData) => linkData.source.y)
      .attr("x2", (linkData) => linkData.target.x)
      .attr("y2", (linkData) => linkData.target.y);
  }

  /**
   * Ceases input from user and lets D3 simulation regain control
   *
   * @param {*} dragEvent - Drag trigger for node
   * @param {*} nodeData - The element being dragged
   */

  function dragended(dragEvent, nodeData) {
    if (!dragEvent.active) simulation.alphaTarget(0);
    nodeData.fx = null;
    nodeData.fy = null;
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
  // initial dimensions
  const width = 3000;
  const height = 3000;
  // modify this value to change the zoom scale
  const initialZoomScale = 2; // HACK: should be based on the size of the graph
  let currentDisplayedNode = null;
  let node, links;

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
    .attr("stroke-dasharray", "20,10")
    .classed("grid-class", true);

  container
    .append("line")
    .attr("x1", width / 2)
    .attr("y1", 0)
    .attr("x2", width / 2)
    .attr("y2", height)
    .attr("stroke", "gray")
    .attr("stroke-width", 5)
    .attr("stroke-dasharray", "20,10")
    .classed("grid-class", true);
  container
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("stroke", "gray")
    .attr("stroke-width", 5)
    .attr("fill", "rgba(255, 255, 255, 0)")
    .attr("stroke-dasharray", "20,10")
    .classed("grid-class", true);

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
    .scaleExtent([1, 50])
    .on("zoom", zoomed);

  svg.call(zoom);

  // allows the zoom to start from the initial zoom scale to avoid initial zoom jump
  zoom.scaleBy(svg, initialZoomScale);

  function zoomed(scrollEvent) {
    container.attr("transform", scrollEvent.transform);
  }

  /***** GENERATING ARROWHEADS FOR LINKS *****/
  const markerColors = {
    red: "red",
    blue: "blue",
    yellow: "yellow",
    green: "green",
    purple: "purple",
    brown: "brown",
    black: "black",
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

  /***** PARSING INFO FROM JSON *****/
  d3.json(jsonUrl)
    .then((data) => {
      // const root = d3.hierarchy(data);
      // const links = root.links();
      // const nodes = root.descendants();

      // defining constants
      const nodes = data.nodes;
      const links = data.links;

      /***** DEFINES MAIN GRAPH SIMULATION *****/
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
        .force("collision", d3.forceCollide().radius(25)); // Prevent node overlap

      // HACK: Creates copy of links to switch the target and source
      //       This is done to flip the arrowheads since they follow
      //       the direction of the link (source to target)
      const reversedLinks = links.map((link) => ({
        source: link.target, // Reverse source and target
        target: link.source,
        linkColor: link.linkColor, // Keep other properties intact
      }));

      // Add the reversedLinks to the original links array
      const allLinks = [...reversedLinks];

      // container that creates all links between nodes as lines
      link = container // HACK: should be declared locally but dragged function can't access properly
        .append("g")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(allLinks)
        .join("line")
        .attr("stroke-width", 2)
        .attr("stroke", (nodeData) => nodeData.source.linkColor || "#999") // Set the link color based on the source node's linkColor property
        // .attr("stroke-dasharray", "4,4") // Set the stroke-dasharray to create dotted lines
        .attr("marker-end", (nodeData) => {
          // Dynamically set the marker-end based on linkColor property
          console.log(nodeData.source.linkColor);
          return `url(#${nodeData.source.linkColor || "default"}-marker)`;
        });

      // container that creates all nodes as circles
      node = container // HACK: should be declared locally but toggleCompletion function can't access properly
        .append("g")
        .attr("fill", "#fff")
        .attr("stroke", "#010002")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("fill", (nodeData) => (nodeData.completed ? colorPalette.nodeColors.green : nodeData.linkColor))
        .attr("r", 15) // Increase node radius for more spacing
        .attr("class", "node")
        .attr("data-code", (nodeData) => nodeData.code)
        .call(drag(simulation))
        .on("click", (mouseEvent, nodeData) => {
          selectedNode = nodeData;
          showNodeInfo(mouseEvent, nodeData);
        })
        .on("mouseover", () => node.style("cursor", "pointer"))
        .on("mouseout", () => node.style("cursor", "default"));

      // stores all texts displayed for nodes
      const nodeText = container
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .text((nodeData) => nodeData.code)
        .attr(
          "font-size",
          (nodeData) =>
            Math.min(
              2 * nodeData.r,
              (2 * nodeData.r - 8) / nodeData.code.length
            ) + "px"
        )
        .attr("dy", "2em") // Adjust vertical position of text
        .style("text-anchor", "middle")
        .attr("fill", "#333")
        .style("pointer-events", "none");

      // appending node's name to respective node
      node.append("title").text((nodeData) => nodeData.code);

      /***** GRAPH SIMULATION *****/
      // update the link, node, and text pos every tick
      simulation.on("tick", () => {
        // constantly connect to the two nodes' x and y pos
        link
          .attr("x1", (nodeData) => nodeData.source.x)
          .attr("y1", (nodeData) => nodeData.source.y)
          .attr("x2", (nodeData) => nodeData.target.x)
          .attr("y2", (nodeData) => nodeData.target.y);

        // Slightly deprecated but it sets the initial node pos + any changes
        // bottom code does the same thing but also adds a bounding box
        node
          .attr("cx", (nodeData) => nodeData.x)
          .attr("cy", (nodeData) => nodeData.y);

        // renders text with respective node
        nodeText
          .attr("x", (nodeData) => nodeData.x)
          .attr("y", (nodeData) => nodeData.y);

        // creates bounding box for nodes within defined dimensions
        node
          .attr("cx", (nodeData) => {
            return (nodeData.x = Math.max(
              15,
              Math.min(width - 15, nodeData.x)
            ));
          })
          .attr("cy", (nodeData) => {
            return (nodeData.y = Math.max(
              15,
              Math.min(height - 15, nodeData.y)
            ));
          });
      });

      // append graph to DOM (graph-container)
      document.getElementById("svg-container").appendChild(svg.node());

      // Call handleResize initially to set the SVG dimensions
      handleResize();
    })
    .catch((error) => {
      console.error("Error loading JSON:", error);

      // error message for user
      const statusElement = document.getElementById("status-message");
      statusElement.textContent =
        "Error loading JSON data. Please make sure the proper file is loaded";
    });

  /***** POPUP ELEMENT *****/
  // Defining popup properties
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

  // Defining name as h2
  const nameInfoElement = popup
    .append("h2")
    .attr("id", "node-info")
    .style("font-family", "monospace")
    .style("white-space", "pre-wrap");

  // Defining description and prerequisites for the main body of the popup
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

  // Event listener and button for closing
  popup
    .append("button")
    .text("Close")
    .on("click", closePopup);

  // Event listener and button for toggling course completion
  popup
    .append("button")
    .text("Toggle Completion")
    .on("click", (mouseEvent) => toggleCompletion(mouseEvent.target));

  /**
   * Grabs name, description, and prereqs from clicked node
   * and displays information in popup
   *
   * @param {*} mouseEvent
   * @param {*} nodeData
   */
  function showNodeInfo(mouseEvent, nodeData) {
    //grabbing information from node
    const nameInfo = nodeData.code;
    const titleInfo = nodeData.name;
    const descInfo = JSON.stringify(nodeData.description, null, 2);
    const prereqInfo = JSON.stringify(nodeData.prerequisites, null, 2);

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
      .style("left", mouseEvent.pageX + 10 + "px")
      .style("top", mouseEvent.pageY + 10 + "px");

    // Displays the popup
    popup.style("display", "block");

    currentDisplayedNode = nodeData;
  }

  /**
   * Hides the popup when "close" button is pressed
   */
  function closePopup() {
    popup.style("display", "none");
  }

  /**
   * Allows classes to be marked as complete or not
   * 
   * @param {*} mouseEvent - Required info for button selection
   */
  function toggleCompletion(mouseEvent) {
    if (selectedNode) {
      selectedNode.completed = !selectedNode.completed;

      // Update button text based on completed state
      // mouseEvent.textContent = selectedNode.completed
      //   ? "Mark as Incompleted"
      //   : "Mark as Completed"

      // Update the node color based on completion status
      node.attr("fill", (nodeData) =>
        nodeData.completed ? colorPalette.nodeColors.green : nodeData.linkColor
      );
    }
  }

  /***** POPUP DRAG BEHAVIOR *****/
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
   * @param {*} dragEvent - drag trigger for popup
   */
  function dragstarted(dragEvent) {
    d3.select(this).raise().classed("active", true);
  }

  /**
   * Left and Top corners of popup follow the pointer on drag
   *
   * @param {*} dragEvent - drag trigger for popup
   */
  function dragged(dragEvent) {
    d3.select(this)
      .style(
        "left",
        parseFloat(d3.select(this).style("left")) + dragEvent.dx + "px"
      )
      .style(
        "top",
        parseFloat(d3.select(this).style("top")) + dragEvent.dy + "px"
      );
  }

  /**
   * Disables dragging by removing the "active" class
   *
   * @param {*} dragEvent - drag trigger for popup
   */
  function dragended(dragEvent) {
    d3.select(this).classed("active", false);
  }
}

function populateDropdown(jsonFiles) {
  const dropdown = document.getElementById("course-dropdown");

  jsonFiles.forEach(file => {
      let text = file.slice(2, -5); //removing the file extension
      console.log(text);

      let btn = document.createElement("button");
      btn.textContent = "File: " + text;

      // Add a click event listener to the button to handle the course selection
      btn.addEventListener("click", function(mouseEvent) {
          courseSelect(file, mouseEvent);
      });

      dropdown.appendChild(btn);
  });
}


function courseSelect(file, mouseEvent) {
  console.log(file);
  jsonUrl = file;

  // Get the existing graph container
  const svgContainer = document.getElementById("svg-container");
  let displayed = document.querySelector(".program-displayed");
  displayed.innerHTML = "<u>Displayed Program:</u> " + file;
  // content.appendChild(displayed);
  // Remove all child nodes (i.e., the existing graph)
  while (svgContainer.firstChild) {
      svgContainer.removeChild(svgContainer.firstChild);
  }

  // Call your graph creation function with the new JSON file URL and the new container
  createForceDirectedGraph(jsonUrl);
}

function toggleGrid() {
  const grid = d3.selectAll(".grid-class");

  grid.each(function (d, i) {
    const element = d3.select(this);

    if (element.classed("active") == true) {
      element.classed("active", false);
    }
    else {
      element.classed("active", true);
    }
  })
}
// CHANGE THIS WITH THE APPROPRIATE JSON FILE
let jsonFiles = ["./example.json", "./example2.json", "./example3.json"];
let jsonUrl = jsonFiles[0];

populateDropdown(jsonFiles);
// courseSelect(jsonFiles[0]);
// Allows the magic to happen :)
createForceDirectedGraph(jsonUrl);
