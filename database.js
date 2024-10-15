const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 1234,
  password: "1234",
  database: "CS Project 3",
});

client.connect();


// database code to get a post
const getPosts = async() => {
    // connect to the database

    // change this to read my posts. 
    const result = await client.query(`SELECT * FROM public.blogs ORDER BY blog_id ASC `)
        
    return result;
}

// database code to get a user
const getUser = async(user_name, password) => {
    // connect to the database

    // change this to read my posts. 
    const result = await client.query(`SELECT * FROM public.users WHERE user_name = '${user_name}'`)
    
    let userData = result.rows[0];

    if (password === userData.password) {
        console.log("password success")
    } else {
        userData = null
    }

    return userData;
}

// code to sign up a user
const insertUser = async(user_name, password, name) => {
    // get last user
    const result = await client.query(`SELECT user_id FROM public.users ORDERBY user_id DSC`)

    console.log(result.rows)
    // get the first user_id number and add 1
    lastId = result.rows[0].user_id
    newId = lastId + 1
    console.log(`New ID!!! ${newId}`)

    // insert data into table now.
    await client.query(`INSERT INTO public.users(
	user_id, password, name, user_name)
	VALUES (${newId}, ${password}, ${name}, ${user_name});`)

    console.log("user added successfully")

}

module.exports = {
    getPosts,
    getUser,
    insertUser
};