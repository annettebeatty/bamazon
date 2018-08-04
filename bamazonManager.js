const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");
const colors = require("colors");

const connection = mysql.createConnection
({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "devPW123",
    database: "bamazonDB"
});

connection.connect(function(err) 
{
    if (err) 
        throw err;
    console.log("connected as id " + connection.threadId);
    showItems();
});

// This function will show the options for the manager to select
// Each option will call the specific function which processes the request
function showItems()
{
    console.log('\033c');
    console.log("bAmazon Manager Main Menu\n".bold.underline);

    inquirer.prompt([
    {
        type: "list",
        name: "choice",
        message: "Choose a menu item",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"]
    }
    ]).then(function(answer) 
    {
        // Now we process it
        // console.log("Picked ", answer.stuff);

        console.log(answer);

        switch (answer.choice)
        {
            case "View Products for Sale":
            {
                viewProducts();
                break;
            }

            case "View Low Inventory":
            {
                viewInventory();
                break;
            }

            case "Add to Inventory":
            {
                let queryIt = "SELECT * FROM products"
                addInventory(queryIt);
                break;
            }

            case "Add New Product":
            {
                addProducts();
                break;
            }

            case "Quit":
            {
                connection.end();
                break;
            }
        }
    });
}

// This function will show all the available products
// to the manager
function viewProducts()
{

    //connection.query("SELECT item_id, SUBSTRING(`product_name`, 1,40) product_name, price, stock_quantity FROM products", function(error, response) 
    connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function(error, response) 
    {
        if (error) 
            throw error;

        console.log("\n");
        console.table(response);

        loopIt();
    });
}

// This function will show all the products with low inventory
function viewInventory()
{
    //console.log("Show products");
    connection.query("SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5", function(error, response) 
    {
        if (error) 
            throw error;

        console.log("\n");

        if (response.length == 0)
        {

            console.log("No products with low inventory");
            loopIt();
        }
        else 
        {
            console.table(response);
            inquirer.prompt([
            {
                type: "confirm",
                message: "\nAdd inventory?: ",
                name: "confirm",
                default: true
            }
            ]).then(function(qtyresponse) 
            {
                if (qtyresponse.confirm)
                {
                    let queryIt = "SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5"
                    addInventory(queryIt);
                } 
                else
                    loopIt();
            });
        }
    });
}

// This function shows the manager all the products so they can pick
// which one they want to add inventory to
function addInventory(query)
{
    var itemArray = [];

    // Grab all the products
    connection.query(query, function(error, response) 
    {
        if (error) 
            throw error;

        // console.log(response);
        
        // Push these in an array we can use for the inquirer
        for (var i=0; i < response.length; i++)
        {
            // Need to show ID, name and price
            itemArray.push(i+1 + ". " + response[i].item_id + " - " + response[i].product_name + " - " + response[i].stock_quantity);
        }

        inquirer.prompt([
        {
            pageSize: 20,
            type: "list",
            name: "stuff",
            message: "Select item to add inventory: ",
            choices: itemArray
        }
        ]).then(function(answer) 
        {
            // Now we prompt the user and process it
            // console.log("Picked ", answer.stuff);
            inquirer.prompt([
            {
                name: "quantity",
                message: "Quantity to add? ",
                validate: function validateQty(name)
                {
                    var reg = /^\d+$/;
                    return reg.test(name) || "Qty must be a positive whole number!";
                }
            },
            {
                type: "confirm",
                message: "\nAre you sure: ",
                name: "confirm",
                default: true
            }
            ]).then(function(qtyresponse) 
            {
                if (qtyresponse.confirm)
                {
                    // Find this item again
                    // console.log("Answer ", answer,"Quantity ", qtyresponse.quantity);
                    processItem(qtyresponse.quantity, answer, response);
                } 
                else
                    loopIt();
            });
        });
    });
}

// Process the updating of inventory 
function processItem(qty, answer, response)
{
    qty = parseInt(qty);

    var id = answer.stuff.substring(0,(answer.stuff.indexOf(".")));

    console.log("ID: ", id);
    
    id = parseInt(id);

    // Calculate the new inventory number
    var newqty = response[id-1].stock_quantity + qty;

    // Update the database
    var query = connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: newqty
        },
        {
          item_id: response[id-1].item_id
        }
      ],
      function(err, res) {
        if (err) 
            throw err;

        // console.log(res.affectedRows + " offer updated!\n");
        console.log("UPDATED: ", response[id-1].item_id + " - " + response[id-1].product_name + " - $" + response[id-1].price + " - " + newqty);
        loopIt();
      }
    );
  
    // logs the actual query being run
   // console.log(query.sql);
}

// This function will add new products to the database
function addProducts()
{
    // Ask user for item_id, product_name, dept_name, price, stock_quantity
    inquirer.prompt([
    {
        name: "item_id",
        message: "Enter 10 digit item-id: ",
        validate: function validateItem(name)
        {
            return name.length == 10 || "Item-id must be 10-digits"
        }
    },
    {
        name: "prod_name",
        message: "Enter Product Name:  ",
        validate: function validateProdName(name)
        {
            return name !== '' || "Must enter a product name"
        }
    },
    {
        name: "dept_name",
        message: "Enter Department Name: ",
        validate: function validateDeptName(name)
        {
            return name !== '' || "Must enter a department name"
        }
    },
    {
        name: "price",
        message: "Enter Price $",
        validate: function validatePrice(name)
        {
            var reg = /^\d+(\.\d{1,2})?$/;
            return reg.test(name) || "Price not valid!!";
        }
    },
    {
        name: "stock_qty",
        message: "Enter beginning stock quantity: ",
        validate: function validateStock(name)
        {
            var reg = /^\d+$/;
            return reg.test(name) || "Stock should be a postive whole number!";
        }
    },
    ]).then(function(answer) 
    {
        // Check to see if this department exists
        var queryIt = "SELECT * FROM departments WHERE dept_name = '" + answer.dept_name + "'";
        var query = connection.query(queryIt, function(error, response) 
        {
            if (error) 
                throw error;

            if (response.length == 0)
            {
                console.log("Department %s doesn't exist.  Re-enter data.", answer.dept_name);
                addProducts();
            }
            else
            {
                // Check if duplicate product
                var queryIt = "SELECT * FROM products WHERE item_id = '" + answer.item_id + "'";
                var query = connection.query(queryIt, function(error, dupResponse) 
                {
                    if (error) 
                        throw error
                
                    if (dupResponse.length == 0)
                        insertNewProduct(answer)
                    else
                    { 
                        console.log("Duplicate item-id.  Re-enter data.");
                        addProducts();
                    }
                });
            }
        });
    });
}

// Once we've checked to make sure the data is good, we'll add the new product into the database
function insertNewProduct(answer)
{
    var query = connection.query(
        "INSERT INTO products SET ?",
        {
            item_id: answer.item_id,
            product_name: answer.prod_name,
            dept_name: answer.dept_name,
            price: answer.price,
            stock_quantity: answer.stock_qty
        },
        function(err, res) {
            if (err) 
                throw err;

            console.log(res.affectedRows + " product added!\n");
            console.log("Added Product: ", answer.item_id + " - " + answer.prod_name + " - " + answer.dept_name + " - $" + answer.price + " Inventory: " + answer.stock_qty);

            // Since they're adding products, give them the choice to keep
            // adding more product versus going back to the main menu
            inquirer.prompt([
            {
                type: "confirm",
                message: "\nAdd another product?: ",
                name: "confirm",
                default: true
            }
            ]).then(function(response) 
            {
                if (response.confirm)
                {
                    addProducts();
                } 
                else
                    loopIt();
            });
        }
    );
}

// This function will loop back to the main menu
function loopIt()
{
    inquirer.prompt([
    {
        type: "confirm",
        message: "\nBack to main menu?: ",
        name: "confirm",
        default: true
    }
    ]).then(function(qtyresponse) 
    {
        if (qtyresponse.confirm)
        {
            showItems();
        } 
        else
            connection.end();
    });
}