const express = require('express')
const app = express()
const port = 3000
const { Sequelize } = require('sequelize');
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const { Op } = require('sequelize');
const Utils = require ('./src/utils.js')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './blog.db'
});
const { DataTypes } = require('sequelize');

const Post = sequelize.define('Post', {
  title: DataTypes.STRING,
  text: DataTypes.TEXT,
});

// Automatically create all tables
sequelize.sync();

app.get('/', async (req, res) => {
  let page = Number(req.query.page) || 0;
  const limit = 3;
  const {count, rows} = await Post.findAndCountAll({
    offset: page*limit,
    limit: limit,
    order: [
      // Will escape title and validate DESC against a list of valid direction parameters
      ['createdAt', 'DESC']
    ]
  });
  const posts = rows;
  let maxPage = Math.ceil(count/limit);
  res.render('main', {
    posts:posts,
    page:page,
    maxPage:maxPage,
    utils: Utils,
    url: req.url
  })
})

app.get('/search', async (req,res) => {
  let page = Number(req.query.page) || 0;
  const limit = 3;
  const {count, rows} = await Post.findAndCountAll({
    offset: page*limit,
    limit: limit,
    order: [
      ['createdAt', 'DESC'],
    ],
    where:  {
      [Op.or]: [
        {text:{[Op.substring]: req.query.text}},
        {title:{[Op.substring]: req.query.text}}
      ]
    },
  });
  const posts = rows;
  let maxPage = Math.ceil(count/limit);
  res.render('main', {
    posts:posts,
    page:page,
    maxPage:maxPage,
    utils: Utils,
    url:req.url
  })
})

app.get('/create', (req, res) => {

  res.render('edit', {
    post: {},
    notFilled: req.query.notFilled
  })
})

app.get('/post/:id', async (req, res) => {
  const post = await Post.findByPk(Number(req.params.id));
  res.render('post', {post:post})
})

app.get('/post/:id/edit', async (req, res) => {
  const post = await Post.findByPk(Number(req.params.id));
  res.render('edit', {
    post:post,
    notFilled: req.query.notFilled
  })
})

app.post('/update', async (req, res) => {
  const postId = (req.body.id == "") ? null : Number(req.body.id);
  if (req.body.title == "" || req.body.text == ""){
    console.log ('no text found');
    if (postId == null){
      return res.redirect('/create?notFilled=true');
    } else {
      return res.redirect(`/post/${postId}/edit?notFilled=true`);
    }
  }
  const [post, created] = await Post.findOrCreate({
    where: {
      id: postId
    }
  });
  post.title = req.body.title;
  post.text = req.body.text;
  post.save();
  res.redirect(`/post/${post.id}`)
})

app.get('/post/:id/delete', async (req, res) => {
  const post = await Post.findByPk(Number(req.params.id));
  await post.destroy();
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
