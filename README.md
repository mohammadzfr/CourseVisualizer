# CourseVisualizer

Display your college courses as an easy-to-understand **interactive graph**!

![Thumbnail](assets/CourseVisThumbnail.png)

This project displays course `codes`, `names`, `descriptions`, and `prerequisites` as a **force-directed graph** using [D3.js](https://d3js.org/)

## Features
- Draggable Nodes
- Toggle Completed Courses
- Custom JSON Input (Input your own courses in JSON format)


## Setup

1. Clone or download this repository in a directory of your choice

```git clone https://github.com/mohammadzfr/CourseVisualizer```

2. If you have a JSON file that only has nodes and no links between them, you can create links for it by using the `process_data.js` file, which will use the `prerequisites` field to create links
    - I recommend downloading and using **[bun](https://bun.sh/)** to run the js file
    - After downloading, use `bun process_data.js` in the `CourseVisualizer` directory

3. Enter the PATH of your compatible JSON file into the `jsonUrl` variable in `graph.js`

4. Run the HTML file in localhost
    - You can use the `Live Server` extension in VSCode or anything similar

## Project Overview
```
CourseVisualizer/
|── assets/
|   |── signature.ico (favicon)
|   |── CourseVisThumbnail.png (thumbnail for README)
|
|── index.html (boilerplate)
|── style.css
|── graph.js (the main program)
|── process_data.js (for creating links out of nodes)
|── example.json (ideal setup of nodes and links for graph.js)
|── input.json (ideal setup of nodes for process_data.js)
```