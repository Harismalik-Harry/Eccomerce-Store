import {getConnection} from '../config/DatabaseConnection.js'
export const insertIntoReview = async (
  rating,
  comments,
  customerId,
  productId
) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "INSERT INTO Review (rating, comments, customer_id, product_id) VALUES (?, ?, ?, ?)",
      [rating, comments, customerId, productId]
    );
    return result;
  } catch (error) {
    throw new Error("Error inserting into Review: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Update a review
export const updateReview = async (reviewId, rating, comments) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "UPDATE Review SET rating = ?, comments = ? WHERE review_id = ?",
      [rating, comments, reviewId]
    );
    return result;
  } catch (error) {
    throw new Error("Error updating Review: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "DELETE FROM Review WHERE review_id = ?",
      [reviewId]
    );
    return result;
  } catch (error) {
    throw new Error("Error deleting Review: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Retrieve reviews for a product
export const getReviewsByProductId = async (productId) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM Review WHERE product_id = ?",
      [productId]
    );
    return rows;
  } catch (error) {
    throw new Error("Error retrieving Reviews: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};
