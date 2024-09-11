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
      console.log("Add");
      console.log("Remove");
      console.log("View");
    } ;

    //call function to display options 

    listOptions();

    //function to handle user input 

    const processOption = (line) => { //stores option to be used

      //checks if user input is Add New Item

      if(line.startsWith('Add ')){
        const item = line.slice(4);
        groceryList.push(item); // adds each item to grocery list
      }
      else if(line === View){
        groceryList.forEach((item, index) => {
          console.log(`${index + 1} , ${item}`);
        })
      }
      else if(line === "Exit"){
        rl.close();
      }
      else {
        console.log("No Item Found");}
  };

   //Readline interface set up that was given to you (MUST EDIT)

rl.on('line', (line) => {
    console.log(line);
});

rl.on('line', (line) => {
  processOption(line); //process the input line
});

// Handle when the readline interface is closed 
rl.once('close', () => {
     // end of input
     console.log("Goodbye");
 });