import { getConnection } from "../config/DatabaseConnection";

// Address Model Functions

// Insert a new address
export const insertIntoAddress = async (
  streetAddress,
  city,
  state,
  postalCode,
  country,
  additionalInfo,
  customerId
) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "INSERT INTO Address (street_address, city, state, postal_code, country, additional_info, customer_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        streetAddress,
        city,
        state,
        postalCode,
        country,
        additionalInfo,
        customerId,
      ]
    );
    return result;
  } catch (error) {
    throw new Error("Error inserting into Address: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Update an address
export const updateAddress = async (
  addressId,
  streetAddress,
  city,
  state,
  postalCode,
  country,
  additionalInfo
) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "UPDATE Address SET street_address = ?, city = ?, state = ?, postal_code = ?, country = ?, additional_info = ? WHERE address_id = ?",
      [
        streetAddress,
        city,
        state,
        postalCode,
        country,
        additionalInfo,
        addressId,
      ]
    );
    return result;
  } catch (error) {
    throw new Error("Error updating Address: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Delete an address
export const deleteAddress = async (addressId) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "DELETE FROM Address WHERE address_id = ?",
      [addressId]
    );
    return result;
  } catch (error) {
    throw new Error("Error deleting Address: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Retrieve an address by ID
export const getAddressById = async (addressId) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM Address WHERE address_id = ?",
      [addressId]
    );
    return rows[0];
  } catch (error) {
    throw new Error("Error retrieving Address: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};
