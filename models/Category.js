/*
Create by li on2017/7/6
*/
//模型类

var mongoose = require('mongoose');
var categoriesSchema = require('../schemas/categories');
//模型类的创建以及暴露
//用于对用户的表结构数据操作
module.exports = mongoose.model('Category',categoriesSchema);