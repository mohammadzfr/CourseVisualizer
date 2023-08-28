// Sample node and link data
const nodes = [
    { id: "A" },
    { id: "B" },
    { id: "C" },
    { id: "D" },
];

const links = [
    { source: "A", target: "B" },
    { source: "B", target: "C" },
    { source: "C", target: "D" },
];

// Call the ForceGraph function with customization options
const Node = ForceGraph(
    {
        nodes: nodes,
        links: links,
    },
    {
        width: 800,
        height: 600,
        nodeRadius: 8,
        linkStrokeWidth: 2,
    }
);

// Append the SVG node to the HTML body
document.body.appendChild(Node);


// Sample node and link data
const nodes1 = [
    { id: "A" },
    { id: "B" },
    { id: "C" },
    { id: "D" },
];

const links1 = [
    { source: "A", target: "B" },
    { source: "B", target: "C" },
    { source: "C", target: "D" },
];

// Call the ForceGraph function with customization options
const Node1 = ForceGraph(
    {
        nodes: nodes1,
        links: links1,
    },
    {
        width: 800,
        height: 600,
        nodeRadius: 8,
        linkStrokeWidth: 2,
    }
);

// Append the SVG node to the HTML body
document.body.appendChild(Node1);




// // Sample hierarchical data
// const hierarchicalData = {
//     name: "A",
//     children: [
//         {
//             name: "B",
//             children: [
//                 {
//                     name: "C",
//                     children: [
//                         { name: "D" }
//                     ]
//                 }
//             ]
//         }
//     ]
// };

// // Create a hierarchy from the data
// const root = d3.hierarchy(hierarchicalData);

// // Create a tree layout
// const treeLayout = d3.tree().size([800, 600]);

// // Compute the layout
// treeLayout(root);

// // Initialize an SVG element
// const svg = d3.create("svg")
//     .attr("width", 800)
//     .attr("height", 600)
//     .append("g")
//     .attr("transform", "translate(50, 50)");

// // Create links
// svg.selectAll(".link")
//     .data(root.links())
//     .enter().append("path")
//     .attr("class", "link")
//     .attr("d", d3.linkVertical()
//         .x(d => d.x)
//         .y(d => d.y)
//     );

// // Create nodes
// svg.selectAll(".node")
//     .data(root.descendants())
//     .enter().append("circle")
//     .attr("class", "node")
//     .attr("cx", d => d.x)
//     .attr("cy", d => d.y)
//     .attr("r", 4);

// // Append the SVG to the DOM
// document.body.appendChild(svg.node());


