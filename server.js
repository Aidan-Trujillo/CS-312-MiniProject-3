// server to handle backend of a blog website

// dependencies
const { readPosts, addPost, getPostById, savePosts } = require('./utils');
const {PostsPath} = require('./constants.js')


// server initialization
var express = require('express');
var fs = require('fs');
var path = require('path');

// start app
var app = express();

// set view engine to ejs
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/Website'));
app.use(express.urlencoded({ extended: true }));

// set static files
app.use(express.static(path.join(__dirname, 'Public')));



// index page (where blog shows up)
app.get('/', async (req,res) => {
    try{
        // get all posts
        const {posts, lastId} = await readPosts(PostsPath);

        console.log(posts.length)
        res.render('index', { 
            title: 'Blog Page', 
            message: 'Welcome to my Blog page!', 
            posts: posts,
            category: "All"});
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error processing the form');
    }
});


// post page (making a blog post) 
app.post('/submit', async (req,res) => {
    // get the time
    const dateTimeFull = Date().toLocaleString().split(' ');
    const dateTime = dateTimeFull.slice(0, 5); 

    console.log(dateTime);

    // get post and add time
    var post = req.body;
    post.time = dateTime.join(' ');

    addPost(PostsPath, post);
    
    res.redirect('/');
});



// change viewing category logic
app.get('/posts', async (req,res) => {
    // get the category
    const category = req.query.category

    // get all posts
    var {posts} = await readPosts(PostsPath);
    // filter out posts if they do not have category as All
    if (category !== "All"){
        posts = posts.filter(post => post.category === category)
    } 

    res.render('index', { 
        title: 'Blog Page', 
        message: 'Welcome to my Blog page!', 
        posts: posts,
        category: category});
    
});



// begin edit a post
app.get('/editPost', async (req,res) => {
    // get the post from the query
    const id = req.query.post;

    // get post by id
    var {posts} = await readPosts(PostsPath);
    const {post, index} = getPostById(id, posts);
    console.log(post)

    // send to an edit post page
    res.render('./editPost', {
        post: post
    })
})

// submit the edited post
app.post('/editPost', async (req, res) => {
    // get the current posts
    var {posts} = await readPosts(PostsPath);

    // get newly edited post
    const post = req.body

    // get the old post index
    const {index} = getPostById(post.id, posts);

    // replace post
    posts[index] = post;
    savePosts(posts);

    console.log("Submitting edited post");

    // redirect to home again
    res.redirect('/');
})


// delete a post
app.get('/deletePost', async (req,res) => {
    // get the post from the query
    const id = req.query.post;

    // get post by id
    var {posts} = await readPosts(PostsPath);
    const {post, index} = getPostById(id, posts);
    console.log("Deleting the following post: ");
    
    // delete post and save (check for special case when only one post)
    if (posts.length === 1) {
        posts = []
    } else {
        posts.splice(index, 1);
    }

    console.log(posts)

    savePosts(posts)

    // send to an edit post page
    res.redirect('/');
})



app.listen(8080);
console.log('Server is listening on port 8080');