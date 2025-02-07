import { getConnection } from "../config/DatabaseConnection.js";
export const getUserByEmail= async (email)=>{
    const connection=await getConnection();
    try{
        const [user]=await connection.execute('select * from user where email = ?',[email]);
        return user.length > 0 ? user[0] : null;


    }catch(error){
        throw error;
    }
    finally{
        connection.release();
    }
}
export const createUser=async (
    firstName,
    lastName,
    email,
    password,
    role
)=>{
    const connection= await getConnection();
    //console.log(connection);
    try{
const [result] = await connection.execute(
      `INSERT INTO User (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, email, password, role]
    );   
    console.log(result)
   // console.log(result)
    return result;
 }
 catch(error)
 {
    console.log(error)
    throw error
 }
 finally{
    connection.release();
 }
};