const Post = require ('../models/post.js')
const { Op } = require('sequelize');
const Utils = require ('../utils.js')

module.exports = {
  index: async (req, res) => {
    let page = Number(req.query.page) || 0;
    const limit = 3;
    const {count, rows} = await Post.findAndCountAll({
      offset: page*limit,
      limit: limit,
      order: [
        // Will escape title and validate DESC against a list of valid direction parameters
        ['createdAt', 'DESC']
      ]
    })
    const posts = rows;
    let maxPage = Math.ceil(count/limit);



    res.render('main', {
      posts:posts,
      page:page,
      maxPage:maxPage,
      utils: Utils,
      url: req.url,
      flash: Utils.readFlash(req.session)
    })
  },

  search: async (req,res) => {
    if (/^\s*$/.test (req.query.text)) {
      req.session.flash = `Please, fill in search field.`;
      return res.redirect ('/');
    } ;
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
    req.session.flash = `search for "${req.query.text}" `;
    res.render('main', {
      posts:posts,
      page:page,
      maxPage:maxPage,
      utils: Utils,
      url:req.url,
      flash: Utils.readFlash(req.session),
      text: req.query.text
    })
  },

  create: (req, res) => {

    res.render('edit', {
      post: {},
      flash: Utils.readFlash(req.session)
    })
  },

  postId: async (req, res) => {
    const post = await Post.findByPk(Number(req.params.id));
    res.render('post', {
      post:post,
      flash: Utils.readFlash(req.session)
    })
  },

  edit: async (req, res) => {
    const post = await Post.findByPk(Number(req.params.id));
    res.render('edit', {
      post:post,
      flash: Utils.readFlash(req.session)
    })
  },

  update: async (req, res) => {
    const postId = (req.body.id == "") ? null : Number(req.body.id);
    if (/^\s*$/.test (req.body.title) || /^\s*$/.test (req.body.text)){
      req.session.flash = "Please, fill all fields.";
      if (postId == null){
        return res.redirect('/create');
      } else {
        return res.redirect(`/post/${postId}/edit`);
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

    if (created) {
      req.session.flash = "Post added succesfully.";
    } else {
      req.session.flash = "Post edited succesfully.";
    }

    res.redirect(`/post/${post.id}`)
  },

  delete: async (req, res) => {
    const post = await Post.findByPk(Number(req.params.id));
    await post.destroy();
    req.session.flash = "Post deleted succesfully.";
    res.redirect('/')
  }
}
