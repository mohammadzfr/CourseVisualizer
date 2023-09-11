// Import required modules
const fs = require('fs');
const fetch = require('node-fetch');
const readline = require("readline");

// Function to load JSON data from a file
function loadJSONFromFile(filePath) {
  try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    throw new Error(`Error loading JSON from file: ${error.message}`);
  }
}

// Function to save JSON data to a file
function saveJSONToFile(filePath, jsonData) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log(`JSON data saved to ${filePath}`);
  } catch (error) {
    throw new Error(`Error saving JSON to file: ${error.message}`);
  }
}

// Load the nodes from a JSON file asynchronously
let jsonFilePath = 'copy.json';

// Function to generate links based on prerequisites
function generateLinks(courseNodes) {
  let courseLinks = [];


  courseNodes.nodes.forEach((node) => {

    console.log("node: ");
    console.log(node);

    if (node.prerequisites && node.prerequisites.length > 0) {
      console.log("Prerequisites found");
      node.prerequisites.forEach((prerequisite) => {
        // Check if the prerequisite exists in the courseNodes array
        console.log(prerequisite);
        const matchingNode = courseNodes.nodes.find((n) => n.code === prerequisite);

        if (matchingNode) {
          courseLinks.push({
            source: node.code,
            target: prerequisite,
          });
        }
      });
    }
  });

  return courseLinks;
}

function takeInput() {
  const q1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  q1.question("Enter the PATH to your JSON file (for default, type nothing) ", function (answer) {
    if (answer == "") {
      console.log("Using default JSON");
    }
    else {
      jsonFilePath = answer;
    }
    q1.close();
  });


}
// Main function to process and generate JSON
async function main() {
  try {
    takeInput();

    // Load course nodes from the JSON file
    const courseNodes = loadJSONFromFile(jsonFilePath);

    // Generate links based on prerequisites
    const courseLinks = generateLinks(courseNodes);

    // Create a new JSON object with nodes and links
    const resultData = {
      nodes: courseNodes,
      links: courseLinks,
    };

    // Save the resulting JSON to a file
    saveJSONToFile('output_course_data.json', resultData);
  } catch (error) {
    console.error(error.message);
  }
}

// Run the main function
main();
