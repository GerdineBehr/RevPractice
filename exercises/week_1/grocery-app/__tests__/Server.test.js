
const fs = require('fs');
const path = require('path');
const {server, resetState} = require('../Server');
const request = require('supertest');


//Set up mocks
jest.mock('fs');
const mockWriteFileSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockExistsSync = jest.fn(); 
const mockCopyFileSync = jest.fn();
const mockUnlinkSync = jest.fn();

fs.writeFileSync = mockWriteFileSync;
fs.readFileSync= mockReadFileSync;
fs.existsSync= mockExistsSync;
fs.copyFileSync= mockCopyFileSync; 
fs.unlinkSync= mockUnlinkSync; 



// Ensure the server is closed after all tests
afterAll((done) => {
    server.close(done);
  });


const dataFilePath = path.join(__dirname, 'data.json');
const backupFilePath = path.join(__dirname, 'data_backup.json');



   //Setting and Resetting 
beforeEach(()=>{
    mockExistsSync.mockImplementation((path) => path === dataFilePath)
    
    mockWriteFileSync.mockClear();
    mockReadFileSync.mockClear();
    mockExistsSync.mockClear();
    mockCopyFileSync.mockClear();
    mockUnlinkSync.mockClear(); 
    
    resetState();
    });
    

 //test 

 test('should do something', () => {
    expect(true).toBe(true);
  });
  

                                  // Testing 

              // Create

describe("Post Items - ",() =>{

    test("Should return 200 and Mock Items ", async () => {
        
        // arrange 
        const newItem = {item: 'Test', quantity: 1 , price: 2.0 }; //new item information 

        // act
        const response = await request(server)
        .post('/items')
        .send(newItem);

        //Assert
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ message: 'Test added'});
    });
});

            // Read 

describe( "Get Items- No items " , () =>{
    
    test("Should return 200 and an empty grocery list if no items exist", async () => {
        //Arrange 
       
       //Act
       const response = await request(server)
        .get('/items');

        //Assert

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({message: "Grocery list", items: []});
        
    });
});

describe( "Get Items - With Items", () =>{
test("Should return 200 and Test Objects", async () => {
        //Arrange

        const newItem = {
            item: 'bananas',
            quantity: 2,
            price: 3.00,
            purchased: "No"
        }

         await request(server)
         .post('/items')
         .send(newItem);


        //Act

        const response = await request(server)
        .get('/items');

        //Assert 
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({message: "Grocery list", items: [newItem]});

});
});


                    //Update

describe("Update Item to Purchased",() => {
    test(" Should update Item to marked as purchase ", async () => {
        //arrange

        const newItem = {
            item: 'bananas',
            quantity: 2,
            price: 3.00,
            purchased: "No"
        }

         await request(server)
         .post('/items')
         .send(newItem);

        //act 
        
        const response = await request(server)
        .put('/items')
        .send(newItem);


        //assert 
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({message: `bananas marked as purchased`});


    });
});


                 //delete

describe("Delete Item",() =>{

    test("Should delete item from data", async () =>{
        //Arrange

        const newItem = { 
            item: 'bananas', 
            quantity: 2,
            price: 3.00, 
            purchased: "No"
        }

        await request(server)
        .post('/items')
        .send(newItem);

        //Act
        const response = await request(server)
        .delete('/items')
        .send(newItem);


        //Assert
       expect(response.statusCode).toBe(200); 
       expect(response.body).toEqual({message: 'bananas deleted'}); 

    });
});

