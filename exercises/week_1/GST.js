// Import the readline module for handling user input in the console
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin, // Read from standard input (keyboard)
  output: process.stdout // Write to standard output (console)
});

//Beginning my grocery list with groceryList array to hold items 

let groceryList = []; //let because the value can change as we add items , [] for empty array 

// Function list for users 
/* users need to be able to 


-ADD 
    -Item names
    -Quantities 
    -Prices
    -Item's bought 
    -Remove Items 
    -Set whether existing item has been bought 

    */


    const listOptions = () => { //arrow function to display options
      console.log("\nO p t i o n s :");
      console.log("Add New Item");
      console.log("Remove Item");
      console.log("View List");
    } ;














rl.on('line', (line) => {
    console.log(line);
});

rl.once('close', () => {
     // end of input
     console.log("Goodbye");
 });