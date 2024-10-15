// server to handle backend of a blog website

// dependencies
const { readPosts, addPost, getPostById, savePosts } = require('./utils');
const {PostsPath} = require('./constants.js')
const {getUser, insertUser} = require ('./database.js')

// server initialization
var express = require('express');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
const { get } = require('https');

// start app
var app = express();

// set view engine to ejs
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/Website'));
app.use(express.urlencoded({ extended: true }));

// set static files
app.use(express.static(path.join(__dirname, 'Public')));

// attempting to use session cookies so that I can save users sessions
app.use(session({
    secret: 'jsojfj3f93-jmpsjf-j2pnoidjfkajsof3jwejg;lksnojd', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  }));

// index page (where blog shows up)
app.get('/', async (req,res) => {
    try{
        // get all posts
        const {posts, lastId} = await readPosts(PostsPath);

        console.log(posts)
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


// ++++++++++++++++++++ login and sign up pages ++++++++++++++++ //
app.get('/login', async (req,res) => {
    res.render('./login', {error: ""});
});

app.post('/login', async (req,res) => {
    const userData = await getUser(req.body.username, req.body.password);


    // check if userData exists and if user was existing
    if (userData != null) {
        console.log("Rendering the root")
        req.session.username = userData.user_name; 
        req.session.name = userData.name
        res.redirect('/');
    } else if (userData === null){
        res.render('./login', {
            error: "Incorrect username or password"
        });
    } else {
        res.render('./signup')
    } 

});

app.get('/signup', async (req,res) => {
    res.render('./signup', {error: ""});
});

app.post('/signup', async (req,res) => {

    // add user
    insertUser(req.body.username, req.body.password, req.body.name);
    
    res.render('./login')

});

app.listen(8080);
console.log('Server is listening on port 8080');