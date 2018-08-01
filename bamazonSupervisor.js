var inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');

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
// * View Product Sales by Department   
// * Create New Department

function showItems()
{

    inquirer.prompt([
    {
        type: "list",
        name: "choice",
        choices: ["View Product Sales by Department", "Create New Department"]
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

            case "Create New Department":
            {
                createDept();
                break;
            }
        }
    });
}

function viewProducts()
{
    var queryIt = "SELECT dept_id, dept_name, overhead_cost,  SUM(product_sales) product_sales, (SUM(product_sales) - overhead_cost) total_profit FROM departments LEFT JOIN products USING (dept_name) GROUP BY dept_id ORDER by dept_id"

    var query = connection.query(queryIt, function(error, response) 
    {
        if (error) 
            throw error;
        //console.log(response);
        console.table(response
        );
        connection.end();
    });
}

function createDept()
{
    // dept_id, dept_name, overhead_cost
    inquirer.prompt([
        {
            name: "dept_id",
            message: "Enter 5 digit Department ID: ",
        },
        {
            name: "dept_name",
            message: "Enter Department Name: ",
        },
        {
            name: "overhead",
            message: "Enter Department Overhead Cost",
        }
        ]).then(function(answer) 
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
                    connection.end();
                }
            );
        
        });
    
}