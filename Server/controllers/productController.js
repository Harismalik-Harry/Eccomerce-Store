import * as cd from "../utils/cloudinaryUtils.js";
import fs from "fs/promises";
import { getConnection } from "../config/DatabaseConnection.js";
import * as productService from "../models/productModel.js";
export const addProduct = async (req, res) => {
  console.log("Starting to add product...");

  const connection = await getConnection();
  console.log("Connection established.");

  try {
    // Extract product details from the request body
    const {
      name,
      description,
      category_name,
      subcategory_name,
      price,
      stock_quantity,
      attributeValues,
    } = req.body;

    console.log("Received product data:", req.body);

    // Category and Subcategory Handling
    console.log(`Searching for category: ${category_name}`);
    let categoryId = await productService.findCategoryByName(
      connection,
      category_name
    );
    if (!categoryId) {
      console.log(`Category not found. Creating category: ${category_name}`);
      categoryId = await productService.createCategory(
        connection,
        category_name
      );
    } else {
      console.log(`Category found with ID: ${categoryId}`);
    }

    console.log(`Searching for subcategory: ${subcategory_name}`);
    let subcategoryId = await productService.findSubcategoryByName(
      connection,
      subcategory_name,
      categoryId
    );
    if (!subcategoryId) {
      console.log(
        `Subcategory not found. Creating subcategory: ${subcategory_name}`
      );
      subcategoryId = await productService.createSubcategory(
        connection,
        subcategory_name,
        "Default description",
        categoryId
      );
    } else {
      console.log(`Subcategory found with ID: ${subcategoryId}`);
    }

    // Add Product
    console.log("Adding product...");
    const productId = await productService.addProduct(
      connection,
      name,
      description,
      subcategoryId
    );
    console.log(`Product added with ID: ${productId}`);

    // Link Product to Seller
    const sellerId = req.user?.id;
    console.log(`Linking product to seller with ID: ${sellerId}`);
    await productService.linkProductToSeller(
      connection,
      1,
      productId,
      price,
      stock_quantity
    );

    // Handle Attribute Values
    if (attributeValues && attributeValues.length > 0) {
      console.log("Processing attribute values...");
      for (const item of attributeValues) {
        const [name, value] = JSON.parse(item);
        console.log(`Processing attribute: ${name} with value: ${value}`);

        const result = await productService.getAttributeByName(
          connection,
          name
        );
        let attribute_id;

        if (result && result.length > 0) {
          attribute_id = result[0].attribute_id;
          console.log(`Found existing attribute with ID: ${attribute_id}`);
        } else {
          console.log(`Attribute not found. Creating attribute: ${name}`);
          const createdAttribute = await productService.createAttribute(
            connection,
            name
          );
          attribute_id = createdAttribute.insertId;
          console.log(`Created new attribute with ID: ${attribute_id}`);
        }

        console.log(
          `Linking attribute value to product. Product ID: ${productId}, Attribute ID: ${attribute_id}, Value: ${value}`
        );
     let res=   await productService.addAttributeValueToProduct(
          connection,
          productId,
          attribute_id,
          value
        );
      }
      console.log(res)
    }

    // Handle Product Pictures
    if (req.files && req.files.length > 0) {
      console.log("Uploading product pictures...");
      for (const [index, file] of req.files.entries()) {
        console.log(`Uploading image ${index + 1}...`);
        const result = await cd.uploadImage(file.path, "products");
        await productService.insertProductPicture(
          connection,
          productId,
          result.secure_url,
          result.public_id,
          index + 1
        );
        console.log(`Image uploaded. URL: ${result.secure_url}`);
        await fs.unlink(file.path); // Remove the file after upload
      }
    }

    // Commit the transaction
    console.log("Committing the transaction...");
    await connection.commit();

    // Respond with success
    console.log("Product added successfully!");
    res.status(201).json({ message: "Product added successfully!" });
  } catch (error) {
    // Log any errors
    console.error("Error adding product:", error);

    // Rollback the transaction in case of an error
    await connection.rollback();
    res
      .status(500)
      .json({ error: "An error occurred while adding the product." });
  } finally {
    // Release the connection back to the pool
    connection.release();
    console.log("Connection released.");
  }
};


export const deleteProduct = async (req,res)=>{
    const {productId}=req.params;
    const connection=await getConnection();
    connection.beginTransaction();
    console.log(productId);
    try{
      const pictures = await productService.getProductPictures(
        connection,productId
      );
      console.log(pictures);
      for (const {cloudinary_public_id} of pictures){
        console.log(cloudinary_public_id);
        await cd.deleteImage(cloudinary_public_id);
      }
       await productService.deleteProductPictures(connection, productId);
       await productService.deleteProductAttributes(connection, productId);
       await productService.deleteProductFromSeller(connection, productId);
       await productService.deleteProduct(connection, productId);
       res.status(200).json({message:'Product Deleted succesfully'})
connection.commit();
    }catch(error){
      console.error('Error Deleting product',error);
      connection.rollback();
      res.status(500).json({message:"Error in Deleting Product "})

    }
    finally{
      if(connection)connection.release();
    }
   
};
 export const updateProduct = async (req, res) => {
  console.log("Starting to update product...");

  const connection = await getConnection();
  console.log("Connection established.");

  try {
    const {
      productId,
      name,
      description,
      category_name,
      subcategory_name,
      price,
      stock_quantity,
      attributeValues,
      picture_cloudinary_urls
    } = req.body;

    console.log("Received update data:", req.body);

    if (!productId) {
      throw new Error("Product ID is required.");
    }

    console.log(`Searching for category: ${category_name}`);
    let categoryId = await productService.findCategoryByName(
      connection,
      category_name
    );
    if (!categoryId) {
      console.log(`Category not found. Creating category: ${category_name}`);
      categoryId = await productService.createCategory(
        connection,
        category_name
      );
    } else {
      console.log(`Category found with ID: ${categoryId}`);
    }

    console.log(`Searching for subcategory: ${subcategory_name}`);
    let subcategoryId = await productService.findSubcategoryByName(
      connection,
      subcategory_name,
      categoryId
    );
    if (!subcategoryId) {
      console.log(
        `Subcategory not found. Creating subcategory: ${subcategory_name}`
      );
      subcategoryId = await productService.createSubcategory(
        connection,
        subcategory_name,
        "Default description",
        categoryId
      );
    } else {
      console.log(`Subcategory found with ID: ${subcategoryId}`);
    }

    console.log("Updating product details...");
    await productService.updateProduct(
      connection,
      productId,
      name,
      description,
      subcategoryId
    );

    const sellerId = req.user?.id;
    console.log(`Updating product-seller link for seller ID: ${sellerId}`);
    await productService.updateProductSellerLink(
      connection,
      productId,
      price,
      stock_quantity
    );

    if (attributeValues && attributeValues.length > 0) {
      console.log("Processing attribute values...");
      for (const item of attributeValues) {
        const [name, value] = JSON.parse(item);
        console.log(`Processing attribute: ${name} with value: ${value}`);

        const result = await productService.getAttributeByName(
          connection,
          name
        );
        let attribute_id;

        if (result && result.length > 0) {
          attribute_id = result[0].attribute_id;
          console.log(`Found existing attribute with ID: ${attribute_id}`);
        } else {
          console.log(`Attribute not found. Creating attribute: ${name}`);
          const createdAttribute = await productService.createAttribute(
            connection,
            name
          );
          attribute_id = createdAttribute.insertId;
          console.log(`Created new attribute with ID: ${attribute_id}`);
        }

        console.log(
          `Linking attribute value to product. Product ID: ${productId}, Attribute ID: ${attribute_id}, Value: ${value}`
        );
        await productService.updateAttributeValueForProduct(
          connection,
          productId,
          attribute_id,
          value
        );
      }
    }

    if (req.files && req.files.length > 0) {
      console.log("Uploading updated product pictures...");
      for (const [public_id, value] of picture_cloudinary_urls) {
        const public_id=await productService.deleteExistingProductPictures(
          connection,
          productId,
          value
        );
       await  cd.deleteImage(public_id);

      }
      for (const [index, file] of req.files.entries()) {
        console.log(`Uploading image ${index + 1}...`);
        const result = await cd.uploadImage(file.path, "products");
        await productService.insertProductPicture(
          connection,
          productId,
          result.secure_url,
          result.public_id,
          index + 1
        );
        console.log(`Image uploaded. URL: ${result.secure_url}`);
        await fs.unlink(file.path); 
      }
    }

    console.log("Committing the transaction...");
    await connection.commit();

    console.log("Product updated successfully!");
    res.status(200).json({ message: "Product updated successfully!" });
  } catch (error) {
    console.error("Error updating product:", error);

    await connection.rollback();
    res
      .status(500)
      .json({ error: "An error occurred while updating the product." });
  } finally {
   
    connection.release();
    console.log("Connection released.");
  }
};
