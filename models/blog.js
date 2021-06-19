var mongoose = require('mongoose');

var blogSchema = new mongoose.Schema({
	image:
	{
        type: String,
        required: false
	},
	fname:{
        type: String,
        required: true 
    },
    title: {
        type: String,
        required: true 
    },
    blogpost: {
        type: String,
        required: true 
    },
    userId: {
        type: String,
        required: true,
    }
});

//Image is a model which has a schema blogSchema

module.exports = new mongoose.model('Blog', blogSchema);