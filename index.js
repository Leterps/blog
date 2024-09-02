const express = require('express')
const app = express()
const port = 3000
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const PostController = require('./src/controllers/PostController.js');


// Automatically create all tables
//sequelize.sync();

app.get('/', PostController.index);

app.get('/search', PostController.search);

app.get('/create', PostController.create);

app.get('/post/:id', PostController.postId);

app.get('/post/:id/edit', PostController.edit);

app.post('/update', PostController.update);

app.get('/post/:id/delete', PostController.delete);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
