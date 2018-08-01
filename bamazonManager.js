var inquirer = require("inquirer");
const mysql = require("mysql");

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

// Logic
// Show menu options
// * View Products for Sale   
// * View Low Inventory
// * Add to Inventory
// * Add New Product

function showItems()
{

    inquirer.prompt([
    {
        type: "list",
        name: "choice",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
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
                addInventory();
                break;
            }

            case "Add New Product":
            {
                addProducts();
                break;
            }
        }
    });
}

function viewProducts()
{
    console.log("Show products");
    connection.query("SELECT * FROM products", function(error, response) 
    {
        if (error) 
            throw error;
    
        for (var i=0; i < response.length; i++)
        {
            // Need to show ID, name and price
            console.log(response[i].item_id + " - " + response[i].product_name + " - $" + response[i].price + " - " + response[i].stock_quantity);
        }

        connection.end();
    });
}

function viewInventory()
{
    console.log("Show products");
    connection.query("SELECT * FROM products", function(error, response) 
    {
        if (error) 
            throw error;
    
        for (var i=0; i < response.length; i++)
        {
            // Only show low stock
            if (response[i].stock_quantity < 5)
                console.log(response[i].item_id + " - " + response[i].product_name + " - $" + response[i].price + " - " + response[i].stock_quantity);
        }

        connection.end();
    });
}

function addInventory()
{
    var itemArray = [];

    connection.query("SELECT * FROM products", function(error, response) 
    {
        if (error) 
            throw error;

        // console.log(response);
        
        for (var i=0; i < response.length; i++)
        {
            // Need to show ID, name and price
            itemArray.push(i+1 + ". " + response[i].item_id + " - " + response[i].product_name + " - " + response[i].stock_quantity);
        }

        inquirer.prompt([
        {
            type: "list",
            name: "stuff",
            message: "Select item to add inventory: ",
            choices: itemArray
        }
        ]).then(function(answer) 
        {
            // Now we process it
            // console.log("Picked ", answer.stuff);

            inquirer.prompt([
            {
                name: "quantity",
                message: "Quantity to add? ",
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
            });
        });
    });
}

function processItem(qty, answer, response)
{
    qty = parseInt(qty);

    var id = answer.stuff.substring(0,(answer.stuff.indexOf(".")));

    console.log("ID: ", id);
    
    id = parseInt(id);

    // update inventory
    var newqty = response[id-1].stock_quantity + qty;

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
        connection.end();
      }
    );
  
    // logs the actual query being run
   // console.log(query.sql);
}

function addProducts()
{
    // item_id, product_name, dept_name, price, stock_quantity
    inquirer.prompt([
    {
        name: "item_id",
        message: "Enter 10 digit item-id: ",
    },
    {
        name: "prod_name",
        message: "Enter Product Name:  ",
    },
    {
        name: "dept_name",
        message: "Enter Department Name: ",
    },
    {
        name: "price",
        message: "Enter Price $",
    },
    {
        name: "stock_qty",
        message: "Enter beginning stock quantity: ",
    },
    ]).then(function(answer) 
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
                connection.end();
            }
          );
    
    });
}