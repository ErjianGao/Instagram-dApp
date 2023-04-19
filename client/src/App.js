import React, { useState, useEffect } from "react";
import Decentragram from './abis/Decentragram.json'
import {
  Grid,
  Typography,
  TextField,
  Button,
  Container,
  Card,
  CardMedia,
  CardContent,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Web3 from "web3";
import Decentragram from "./abis/Decentragram.json";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "60%",
    margin: "0 auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  input: {
    display: "none",
  },
  button: {
    marginTop: theme.spacing(2),
    margin: theme.spacing(1),
  },
  // textField: {
  //     flexGrow: 1
  // },
  card: {
    maxWidth: 600,
    margin: "auto",
    marginBottom: theme.spacing(2),
    backgroundColor: "#fafafa",
  },
  cardContent: {
    paddingBottom: 0,
  },
  image: {
    paddingTop: "100%",
  },
}));

function Post({ post, onLike, onComment }) {
  const [comment, setComment] = useState("");
  const classes = useStyles();

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComment(post.id, comment);
    setComment("");
  };

  const handleTip = async (postId, tipAmount) => {
    const provider = window.ethereum;

    if (provider) {
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      
      const networkId = await web3.eth.net.getId();
      const networkData = Decentragram.networks[5777];
      
      if (networkData) {
        const decentragram = new web3.eth.Contract(Decentragram.abi, networkData.address);
        await decentragram.methods.tipPost(postId).send({ from: account, value: web3.utils.toWei(tipAmount, "ether") });
      }
    }
  } 

  return (
    <Card className={classes.card}>
      <CardMedia className={classes.image} image={post.image} title="Post" />
      <CardContent className={classes.cardContent}>
        <Typography variant="body2" color="textSecondary">
          {post.description}
        </Typography>
      </CardContent>
      <div>
        <Button
          className={classes.button}
          variant="outlined"
          color="primary"
          onClick={() => onLike(post.id)}
        >
          Like ({post.likes})
        </Button>
      </div>
      <div>
        <Button
          className={classes.button}
          variant="outlined"
          color="primary"
          onClick={() => handleTip(post.id, "1")}
        >
          Tip 1 Ether
        </Button>
        <Button
          className={classes.button}
          variant="outlined"
          color="primary"
          onClick={() => handleTip(post.id, "5")}
        >
          Tip 5 Ether
        </Button>
        <Button
          className={classes.button}
          variant="outlined"
          color="primary"
          onClick={() => handleTip(post.id, "10")}
        >
          Tip 10 Ether
        </Button>
      </div>
      <CardContent className={classes.cardContent}>
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            className={classes.textField}
            variant="outlined"
            label="Comment"
            value={comment}
            onChange={handleCommentChange}
          />
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            type="submit"
          >
            Comment
          </Button>
        </form>
        <ul>
          {post.comments.map((comment, index) => (
            <li key={index}>{comment}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [posts, setPosts] = useState([]);
  const [highestLikes, setHighestLikes] = useState(0);
  const classes = useStyles();

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    const provider = window.ethereum;

    if (provider) {
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      const networkId = await web3.eth.net.getId();
      const networkData = Decentragram.networks[5777];
  

      if (networkData) {
        const decentragram = new web3.eth.Contract(
          Decentragram.abi,
          networkData.address
        );
      } else {
        window.alert("Decentragram contract not deployed to detected network.");
      }
    } else {
      window.alert("Please install MetaMask!");
    }
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    const newPost = {
      id: Date.now(),
      image: URL.createObjectURL(file),
      description: description,
      likes: 0,
      comments: [],
    };
    setPosts([...posts, newPost]);
    setFile(null);
    setDescription("");
  };

  const handleLike = (postId) => {
    const newPosts = [...posts];
    const postIndex = newPosts.findIndex((post) => post.id === postId);
    newPosts[postIndex].likes++;
    setPosts(newPosts);
    setHighestLikes(
      newPosts.reduce((acc, post) => (post.likes > acc ? post.likes : acc), 0)
    );
  };

  const handleComment = (postId, comment) => {
    const newPosts = [...posts];
    const postIndex = newPosts.findIndex((post) => post.id === postId);
    newPosts[postIndex].comments.push(comment);
    setPosts(newPosts);
  };

  const sortedPosts = [...posts].sort((a, b) => b.likes - a.likes);

  return (
    <Container className={classes.root}>
      <Typography variant="h1" align="center" gutterBottom>
        Instagram
      </Typography>
      <form className={classes.form} onSubmit={handlePostSubmit}>
        <input
          className={classes.input}
          type="file"
          onChange={handleFileUpload}
          id="upload-image"
        />
        <label htmlFor="upload-image">
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            component="span"
          >
            Upload Image
          </Button>
        </label>
        <TextField
          className={classes.textarea}
          variant="outlined"
          multiline
          // rows={4}
          label="Description"
          value={description}
          onChange={handleDescriptionChange}
          margin="normal"
          id="fullWidth"
        />
        <Button
          className={classes.button}
          type="submit"
          variant="contained"
          color="primary"
        >
          Post
        </Button>
      </form>
      <hr />
      <Typography variant="h2" align="center" gutterBottom>
        Most Popular {highestLikes} likes
      </Typography>
      <Grid container spacing={3}>
        {sortedPosts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Post post={post} onLike={handleLike} onComment={handleComment} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default App;
