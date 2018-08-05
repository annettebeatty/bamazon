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

// Logic
// Show user ID, name and price
// Ask user ID of product they want to buy
// Ask user quantity they want to purchase
// Check quantity available
// If no, console.log "Insufficent quantity available"
// Else 
//   Update inventory
//   Show customer total cost

// This function will show the user the products in the database
function showItems()
{
    var itemArray = [];
    console.log('\033c');
    console.log("bAmazon Customer Ordering System\n".bold.inverse);

    connection.query("SELECT * FROM products ORDER BY dept_name, product_name", function(error, response) 
    {
        if (error) 
            throw error;

        // console.log(response);
        
        for (var i=0; i < response.length; i++)
        {
            // Need to show ID, name and price
            itemArray.push(i+1 + ". " + response[i].item_id + " - " + response[i].product_name + " - $" + response[i].price);
        }

        inquirer.prompt([
        {
            pageSize: 20,
            type: "list",
            name: "stuff",
            message: "What would you like to purchase? ",
            choices: itemArray
        }
        ]).then(function(answer) 
        {
            // Now we process it
            // console.log("Picked ", answer.stuff);

            inquirer.prompt([
            {
                name: "quantity",
                message: "Quantity to purchase? ",
                validate: function validateQty(name)
                {
                    var reg = /^\d+$/;
                    return reg.test(name) || "Quantity should be a whole number!";
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

// Here's where we take the input from inquirer and map it back to the
// product in the array which holds our database data.  Then calls
// updateInvetory to process inventory adjustments
function processItem(qty, answer, dbResponse)
{
    qty = parseInt(qty);

    var id = answer.stuff.substring(0,(answer.stuff.indexOf(".")));

    // console.log("ID: ", id);
    
    id = parseInt(id);

    // console.log("Ordering ", dbResponse[id-1].product_name, "Quanity in Stock ", dbResponse[id-1].stock_quantity);
    if (qty <= dbResponse[id-1].stock_quantity)
    {
        // update inventory
        updateInventory(dbResponse[id-1], qty);
    }
    else
    {        
        console.log("Sorry, inventory too low");
        loopIt();
    }
}

// This function processes the inventory adjustments and updates the database
// It then calls the function to show the customer their order detail
function updateInventory(dbResponse, orderQty) {
    // console.log("Updating inventory ...\n");
    // console.log(dbResponse);

    // update inventory
    var newqty = dbResponse.stock_quantity - orderQty;
  
    // update sales
    var totSales = dbResponse.product_sales + (orderQty * dbResponse.price);

    var query = connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: newqty, 
          product_sales: totSales
        },
        {
          item_id: dbResponse.item_id
        }
      ],
      function(err, res) {
        // console.log(res.affectedRows + " offer updated!\n");
        showCustomer(orderQty, dbResponse);

        loopIt();
      }
    );
  
    // logs the actual query being run
   // console.log(query.sql);
}

// This function just spits out order detail to the console
function showCustomer(qty, dbResponse)
{
    var totPrice = dbResponse.price * qty;
    totPrice = parseFloat(Math.round(totPrice * 100) / 100).toFixed(2);
    console.log("Total: Qty - ", qty, "Total Cost - $", totPrice, " Product -", dbResponse.product_name);

    // Save order for an ending summary

    var query = connection.query(
        "INSERT INTO orders SET ?",
        {
            qty: qty,
            total_price: totPrice,
            product: dbResponse.product_name
        },
        function(err, res) 
        {
            if (err) 
                throw err;

            //loopIt();
        }
    );
}


// This function will loop back to pick more items
function loopIt()
{
    inquirer.prompt([
    {
        type: "confirm",
        message: "\nOrder another item?: ",
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
        {
            var query = connection.query("SELECT * FROM orders", function(error, response) 
            {
                if (error) 
                    throw error;
                
                let total = 0;
                for (var i = 0; i < response.length; i++)
                {
                    total += response[i].total_price;
                }
                // Show everything the customer ordered;
                console.log('\033c');
                console.log("bAmazon Customer Ordering System\n".bold.inverse);
                console.log("\nOrder summary:\n".bold)
                console.table(response);
                console.log("\nTotal: $".bold, colors.blue.bold(total));
                console.log("\nThank you for your business!\n")

                // clean up order table
                var query = connection.query("TRUNCATE TABLE orders", function(error, response) 
                {
                    if (error) 
                        throw error;

                    connection.end();
                });
         });
        }

    });
}

