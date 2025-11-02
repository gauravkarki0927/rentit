import Post from "../model/PostModel.js";

const createPost = async (req, res) => {
  try {
    const { _id, name, price, description, category } = req.body;
    const newPost = new Post({ _id, name, price, description, category });
    await newPost.save();
    res.status(200).json({
      post: newPost,
    });
  } catch (error) {
    res.ststus(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getPost = async (req, res) => {
  try {
    const allPost = await Post.find();
    if (!allPost || allPost.length === 0) {
      res.json({
        message: "There is no Post",
      });
    }
    res.status(200).json({
      success: true,
      posts: allPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const allPost = await Post.findById(id);
    if (!allPost || allPost.length === 0) {
      res.json({
        message: "There is no Post",
      });
    }
    res.status(200).json({
      success: true,
      posts: allPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { name, price, description, category },
      { new: true }
    );

    if (!updatedPost) {
      res.json({
        message: "Posts not found",
      });
    }
    res.status(200).json({
      post: updatedPost,
    });
  } catch (error) {
    res.ststus(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      res.json({
        message: "Post not found, cannot delete",
      });
    }
    res.status(200).json({
      message: "Post deleted successfully",
      post: deletedPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const PostController = {
  createPost,
  getPost,
  getPostById,
  updatePost,
  deletePost,
};
