const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');
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

// Show list of choices for the supervisor
function showItems()
{
    console.log('\033c');
    console.log("bAmazon Supervisor Main Menu\n".bold.inverse);

    inquirer.prompt([
    {
        type: "list",
        name: "choice",
        message: "Choose a menu item",
        choices: ["View Product Sales by Department", "View Top Product Sales by Item", "Create New Department", "Quit"]
    }
    ]).then(function(answer) 
    {
        // Now we process it
        // console.log("Picked ", answer.stuff);

        console.log(answer);

        switch (answer.choice)
        {
            case "View Product Sales by Department":
            {
                viewProducts();
                break;
            }

            case "View Top Product Sales by Item":
            {
                viewTopSales();
                break;
            }

            case "Create New Department":
            {
                createDept();
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

// This pulls the data from the database and shows it to the user
function viewProducts()
{
    var queryIt = "SELECT dept_id, dept_name, overhead_cost,  SUM(product_sales) product_sales, (SUM(product_sales) - overhead_cost) total_profit FROM departments LEFT JOIN products USING (dept_name) GROUP BY dept_id ORDER by dept_id"

    var query = connection.query(queryIt, function(error, response) 
    {
        if (error) 
            throw error;
        //console.log(response);
        console.log("\n");
        console.table(response);
        loopIt();
    });
}

// This pulls the data from the database and shows it to the user
function viewTopSales()
{
    var queryIt = "SELECT * FROM products ORDER BY  product_sales DESC"

    var query = connection.query(queryIt, function(error, response) 
    {
        if (error) 
            throw error;
        //console.log(response);
        console.log("\n");
        console.table(response);
        loopIt();
    });
}

// This function will take the user input for a new department and 
// stuff it into the database
function createDept()
{
    // dept_id, dept_name, overhead_cost
    inquirer.prompt([
    {
        name: "dept_id",
        message: "Enter 5 digit Department ID: ",
        validate: function validateStock(name)
        {
            var reg = /^\d{5}$/;
            return reg.test(name) || "Dept ID should be a 5-digit number!";
        }
    },
    {
        name: "dept_name",
        message: "Enter Department Name: ",
    },
    {
        name: "overhead",
        message: "Enter Department Overhead Cost",
        validate: function validateOverhead(name)
        {
            var reg = /^\d+$/;
            return reg.test(name) || "Overhead should be a whole number!";
        }
    }
    ]).then(function(answer) 
    {
        // Check if duplicate department
        var queryIt = "SELECT * FROM departments WHERE dept_id = '" + answer.dept_id + "'";
        var query = connection.query(queryIt, function(error, dupResponse) 
        {
            if (error) 
                throw error
        
            if (dupResponse.length == 0)
                insertNewDepartment(answer)
            else
            { 
                console.log("\nThis dept-id already exists.  Re-enter data.");
                createDept();
            }
        });

    });  
}

function insertNewDepartment(answer)
{
    var query = connection.query(
        "INSERT INTO departments SET ?",
        {
            dept_id: answer.dept_id,
            dept_name: answer.dept_name,
            overhead_cost: answer.overhead
        },
        function(err, res) 
        {
            if (err) 
                throw err;

            console.log(res.affectedRows + " department added!\n");
            console.log("Added Department: ", answer.dept_id + " - " + answer.dept_name + " - " + "Overhead: " + answer.overhead);

            // Since they're adding departments, give them the choice to keep
            // adding more product versus going back to the main menu
            inquirer.prompt([
                {
                    type: "confirm",
                    message: "\nAdd another department?: ",
                    name: "confirm",
                    default: true
                }
                ]).then(function(response) 
                {
                    if (response.confirm)
                    {
                        createDept();
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