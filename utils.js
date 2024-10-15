const fs = require('fs');
const {PostsPath} = require('./constants.js');
const { json } = require('express');
const { getPosts } = require('./database.js');

// function that outputs an array of blog posts
const readPosts = async (filePath) => {
    try{
        const result = await getPosts();
        const posts = result.rows;
        
        // get the next index so we know how many posts there are total
        var lastId = 0
        if (posts.length > 0){
            lastId = posts[posts.length - 1].blog_id;
        }
        
        return {posts, lastId};

    } catch (err) {
        console.error('Error quering data: ', err)
        // send black blank file
        return []
    }
};


// function that simplly adds a newly created post
const addPost = async (filePath, post) => {
    // get list of posts
    const {posts, lastId} = await readPosts(PostsPath);
    // get the next index to add to the post
    post.id = Number(lastId) + 1;
    
    // push the post and get it ready to write to the file
    posts.push(post);
    const formattedData = JSON.stringify(posts, null, 2);

    await fs.promises.writeFile(filePath, formattedData, (err) => {
        if (err) throw err;
        console.log("added " +data+ " to blogPost");
    });
};


// a function to get a certain post by an id, posts list is given to the function
// returns a single post
// this should only be used when the index is known
const getPostById = (id, posts) => {

    var index = 0
    console.log("Entering getPostById")
    console.log(posts)
    console.log(posts[index])
    var currentId = posts[index].id;
    
    // iterate through the posts to find the id and then get the information
    while (String(currentId) !== String(id)){
        index++;
        currentId = posts[index].id;
    }

    const post = posts[index];

    return {post , index};
}

// a function that saves a post. Takes post list and just writes to the file
const savePosts = async (posts) => {
    const formattedData = JSON.stringify(posts, null, 2);

    await fs.promises.writeFile(PostsPath, formattedData, (err) => {
        if (err) throw err;
        console.log("blog post saved");
    });
}


module.exports = {
    readPosts,
    addPost, 
    getPostById,
    savePosts
}