CREATE TABLE `User` (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(40) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Admin (
    admin_id INT PRIMARY KEY,
    CONSTRAINT Admin_User_FK FOREIGN KEY (admin_id) REFERENCES `User`(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Seller Table with Overall Rating
CREATE TABLE Seller (
    seller_id INT PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    
    contact VARCHAR(15) NOT NULL,
    positive_response FLOAT CHECK (positive_response BETWEEN 0 AND 1),
    rating FLOAT CHECK (rating BETWEEN 0 AND 5),
    overall_rating FLOAT CHECK (overall_rating BETWEEN 0 AND 5) DEFAULT 0,
    CONSTRAINT Seller_User_FK FOREIGN KEY (seller_id) REFERENCES `User`(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Customer (
    customer_id INT PRIMARY KEY,
    contact_number VARCHAR(15) NOT NULL,
    CONSTRAINT Customer_User_FK FOREIGN KEY (customer_id) REFERENCES `User`(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE StoreReview (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    customer_id INT NOT NULL,
    review_text TEXT NOT NULL,
    rating FLOAT CHECK (rating BETWEEN 0 AND 5),
    review_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT StoreReview_Seller_FK FOREIGN KEY (seller_id) REFERENCES Seller(seller_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT StoreReview_Customer_FK FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);
CREATE TABLE Subcategory (
    subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    CONSTRAINT FK_Subcategory_Category FOREIGN KEY (category_id) REFERENCES Category(category_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    subcategory_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_Product_Subcategory FOREIGN KEY (subcategory_id) REFERENCES Subcategory(subcategory_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Product_Attribute (
    attribute_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Product_Attribute_Value (
    value_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    attribute_id INT NOT NULL,
    value VARCHAR(255) NOT NULL,
    CONSTRAINT FK_Product_Attribute_Value_Product FOREIGN KEY (product_id) REFERENCES Product(product_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Product_Attribute_Value_Attribute FOREIGN KEY (attribute_id) REFERENCES Product_Attribute(attribute_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Product_Picture (
    picture_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    cloudinary_url VARCHAR(255) NOT NULL, -- URL to the image stored in Cloudinary
    cloudinary_public_id VARCHAR(255) NOT NULL, -- Public ID for managing the image in Cloudinary
    picture_order TINYINT NOT NULL CHECK (picture_order BETWEEN 1 AND 5), -- Order of the picture for the product
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Product_Picture FOREIGN KEY (product_id) REFERENCES Product(product_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(product_id, picture_order)
);

CREATE TABLE Seller_Product (
    seller_id INT NOT NULL,
    product_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
    PRIMARY KEY (seller_id, product_id),
    CONSTRAINT FK_Seller_Product FOREIGN KEY (seller_id) REFERENCES Seller(seller_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Product_Seller FOREIGN KEY (product_id) REFERENCES Product(product_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE `Order` (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    customer_id INT NOT NULL,
    CONSTRAINT Order_Customer_FK FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Order_Item (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT FK_Order_Order_Item FOREIGN KEY (order_id) REFERENCES `Order`(order_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Product_Order_Item FOREIGN KEY (product_id) REFERENCES Product(product_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    additional_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    customer_id INT,
    CONSTRAINT Address_Customer_FK FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
    ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_id INT NOT NULL UNIQUE,
    CONSTRAINT Payment_Order_FK FOREIGN KEY (order_id) REFERENCES `Order`(order_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    rating FLOAT CHECK (rating BETWEEN 0 AND 5),
    comments TEXT,
    review_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    CONSTRAINT Review_Customer_FK FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT Review_Product_FK FOREIGN KEY (product_id) REFERENCES Product(product_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- Can be 'active', 'completed', 'abandoned'
    CONSTRAINT FK_Cart_Customer FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Cart_Item (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Cart_Cart_Item FOREIGN KEY (cart_id) REFERENCES Cart(cart_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Product_Cart_Item FOREIGN KEY (product_id) REFERENCES Product(product_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
alter table `User` add column password varchar(60) NOT NULL;
ALTER TABLE subcategory ADD CONSTRAINT uni_sub UNIQUE (name);
ALTER TABLE Product_Attribute ADD CONSTRAINT  UNIQUE (name);
alter table `Order` modify column order_status varchar(30) default 'Not Active';
alter table `Order` add constraint check_status check (order_status in ('Not Active','Pending','Delivered'));