// Import the readline module for handling user input in the console
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin, // Read from standard input (keyboard)
  output: process.stdout // Write to standard output (console)
});
// note: The above will not be included in my Server.js because we are no longer going to be communicating via the command line 
//Beginning my grocery list with groceryList array to hold items 

let groceryList = []; //let because the value can change as we add items , [] for empty array 
const amounts = {};
const prices = {};
const purchased = {};

// Function list for users 
/* users need to be able to 


   //Menu of Options/Home page
    */
    const listOptions = () => { //arrow function to display options
      console.log("\nO p t i o n s :");
      console.log("Add - Add [Item]");
      console.log("Remove - Remove [Item] ");
      console.log("View");
      console.log("Purchase Status")
    } ;

    //call function to display options 

    listOptions();

    //function to handle user input 

    const processOption = (line) => { //stores option to be used

      const trimmedLine = line.trim();
        //ADD
      //checks if user input is Add New Item

      if(trimmedLine.startsWith('Add ')){

        const item = trimmedLine.slice(4).trim(); // remove add and trim extra spaces 
        
        rl.question(`How many ${item} do you want to add?`, (quantity) => {
          const amount = parseInt(quantity.trim(), 10); //process the input line
          if(isNaN(amount) || amount <=0 ){
            console.log("Invalid quantity. Please enter a positive number.");
            rl.prompt();
          }else{
            rl.question("Enter price in the format [0.00] ", (cost) => {
              const price = parseFloat(cost.trim());
              if(isNaN(price) || price <=0) {
                console.log("Invalid price, please try again.");
                rl.prompt();
              } else {
            groceryList.push(item);
            amounts[item] = (amounts[item] || 0) + amount; //update quantity
            prices[item] = price; //update price 
            purchased[item] = false; // set purchased status to false 
            console.log(`${amount} ${item} added for $${price.toFixed(2)} each. `);
             listOptions();
             }
            });
          }
        });
      }

      //VIEW  
      else if(trimmedLine === 'View'){
        console.log("\nYour Grocery List:");
        if(groceryList.length === 0){
          console.log("Your list is empty.");
        } else {
        groceryList.forEach((item, index) => {
          const status = purchased[item] ? "Yes" : "No"
          console.log(`${index + 1}. ${amounts[item]} ${item} - Price: $${prices[item]} each - Bought: [${status}]`);

        });
        }
        rl.prompt();
      }

      //Purchase Status 
      else if(trimmedLine === 'Purchase Status'){
        rl.question("Enter the name of the item that you have purchased: ", (boughtItem) => {
          const item = boughtItem.trim();
        if(groceryList.includes(item)){
          purchased[item] = true; //Mark item purchased
        console.log(`${item} has been marked as purchased.`);
      } else {
        console.log(`${item} is not in your grocery list.`);
      }
      
      // Now display the grocery list
    console.log("\nYour Grocery List:");
    if (groceryList.length === 0) {
      console.log("Your list is empty.");
    } else {
      groceryList.forEach((item, index) => {
        const status = purchased[item] ? "Yes" : "No";
        console.log(`${index + 1}. ${amounts[item]} ${item}(s) - Price: $${prices[item]} each - Bought: ${status}`);
      });
    }

    rl.prompt();
  });
}
      
// REMOVE
else if (trimmedLine.startsWith('Remove ')) {
  const item = trimmedLine.slice(7).trim(); // Get the item name after 'Remove ' and trim spaces

  if (groceryList.includes(item)) {
    const index = groceryList.indexOf(item);
    groceryList.splice(index, 1); // Remove the item from the grocery list
    delete amounts[item];
    delete prices[item];
    delete purchased[item];

    console.log(`${item} has been removed from your grocery list.`);
  } else {
    console.log(`${item} is not in your grocery list.`);
  }

  // Show the updated grocery list
  console.log("\nYour Grocery List:");
  if (groceryList.length === 0) {
    console.log("Your list is empty.");
  } else {
    groceryList.forEach((item, index) => {
      const status = purchased[item] ? "Yes" : "No";
      console.log(`${index + 1}. ${amounts[item]} ${item} - Price: $${prices[item]} each - Bought: [${status}]`);
    });
  }
  rl.prompt();
}
      // exit 
     else if(trimmedLine === "Exit"){
        rl.close();
      }

      //Invalid input
      else {
        console.log("Invalid command. Please try again.");

        rl.prompt();
      }
  };

  //Readline interface set up that was given to you (MUST EDIT)

rl.on('line', (line) => {
  processOption(line); //process the input line
});

// Handle when the readline interface is closed 
rl.once('close', () => {
     // end of input
     console.log("Goodbye"); 
 });