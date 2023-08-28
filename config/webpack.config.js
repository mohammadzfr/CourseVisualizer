const path = require('path');
const relativePath = '../' + __dirname;

console.log(relativePath);
module.exports = {
  mode: 'development',
  entry: '../src/index.js', // Your entry file
  output: {
    filename: 'bundle.js', // Output bundle filename
    path: path.resolve(relativePath, 'dist'), // Output directory
  },
};
