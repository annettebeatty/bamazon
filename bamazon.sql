DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE orders (
  qty DECIMAL(10) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  product VARCHAR (80) NOT NULL
);

CREATE TABLE departments (
  dept_id CHAR(5) NOT NULL,
  dept_name VARCHAR(50) NOT NULL,
  overhead_cost DECIMAL (12) NOT NULL,
  PRIMARY KEY (dept_id)
);

INSERT INTO departments (dept_id, dept_name, overhead_cost)
VALUES ("10010", "Accessories", 10000);

INSERT INTO departments (dept_id, dept_name, overhead_cost)
VALUES ("10020", "Electronics", 60000);

INSERT INTO departments (dept_id, dept_name, overhead_cost)
VALUES ("10030", "Home & Kitchen", 40000);

INSERT INTO departments (dept_id, dept_name, overhead_cost)
VALUES ("10040", "Luggage & Travel Gear", 22000);

INSERT INTO departments (dept_id, dept_name, overhead_cost)
VALUES ("10050", "Pet Supplies", 40000);

CREATE TABLE products (
  item_id CHAR(10) NOT NULL,
  product_name VARCHAR(80) NOT NULL,
  dept_name VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT(10) NOT NULL,
  product_sales DECIMAL(14,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (item_id)
);

-- Creates new rows containing data in all named columns --
INSERT INTO products (item_id, product_name, dept_name, price, stock_quantity, product_sales)
VALUES ("B002HMBVKW", "OXO Good Grips Soap Dispensing Palm Brush", "Home & Kitchen", 4.99, 10, 30000.00);

INSERT INTO products (item_id, product_name, dept_name, price, stock_quantity, product_sales)
VALUES ("B0009YWKUA", "Blue Buffalo Life Protection Formula Natural Adult Dry Dog Food", "Pet Supplies", 46.99, 30, 50000.00);

INSERT INTO products (item_id, product_name, dept_name, price, stock_quantity, product_sales)
VALUES ("B00TQPO4R0", "O2COOL Deluxe Necklace Fan", "Home & Kitchen", 10.65, 50, 70000.00);

INSERT INTO products (item_id, product_name, dept_name, price, stock_quantity, product_sales)
VALUES ("B00T24Q3DS", "eBags Packing Cubes - 6pc Value Set (Black)", "Luggage & Travel Gear", 49.98, 20, 30000.00);

INSERT INTO products (item_id, product_name, dept_name, price, stock_quantity, product_sales)
VALUES ("B01M5DS0Z7", "Pet Grooming Brush", "Pet Supplies", 10.37, 100, 20000.00);

INSERT INTO products (item_id, product_name, dept_name, price, stock_quantity, product_sales)
VALUES ("B01C3JAQDQ", "Charmin Dash Button – Save 5% on all products ordered through this button", "Home & Kitchen", 4.99, 100, 50000.00);

INSERT INTO products (item_id, product_name, dept_name, price, stock_quantity, product_sales)
VALUES ("B01M0S525O", "Shark Attack Hand-Painted Ceramic Sushi Serving Platter", "Home & Kitchen", 34.94, 100, 40000);

INSERT INTO products (item_id, product_name, dept_name, price, stock_quantity, product_sales)
VALUES ("B00F7H0BLO", "StickerJOE Ticket to Hell Funny Cool Sticker 3.5 X 2", "Accessories", 2.97, 100, 30000.00);

INSERT INTO products (item_id, product_name, dept_name, price, stock_quantity, product_sales)
VALUES ("B00004RDF0", "Lello 4080 Musso Lussino 1.5-Quart Ice Cream Maker, Stainless", "Home & Kitchen", 730.75, 100, 30000.00);

INSERT INTO products (item_id, product_name, dept_name, price, stock_quantity, product_sales)
VALUES ("B074XLMYY5", "All-new Sonos One - Smart Speaker with Alexa voice control built-In", "Electronics", 199.00, 100, 60000.00);

USE bamazonDB;
SELECT item_id, product_name, price, stock_quantity FROM products;
SELECT * FROM departments;

SELECT dept_id, dept_name, overhead_cost,  SUM(product_sales) product_sales, (SUM(product_sales) - overhead_cost) total_profit FROM departments
LEFT JOIN products USING (dept_name) GROUP BY dept_id ORDER by dept_id

SELECT item_id, product_name, dept_name, price, stock_quantity, product_sales FROM products ORDER BY dept_name

SELECT * FROM products ORDER BY  product_sales DESC

SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5
