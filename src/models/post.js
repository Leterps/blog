const sequelize = require ('../db.js');
const { DataTypes } = require('sequelize');
const Post = sequelize.define('Post', {
  title: DataTypes.STRING,
  text: DataTypes.TEXT,
});
module.exports = Post;
