import React, { useState, useEffect } from "react";
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

// const ipfsClient = require('ipfs-http-client');
// const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https', headers: { authorization: '2OfXMmDhQUk4chI100O92945dNg' } });

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

function Post({ decentragram, post, onLike, onComment }) {
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

      await decentragram.methods
        .tipPost(postId)
        .send({ from: account, value: web3.utils.toWei(tipAmount, "ether") });
    }
  };

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
          onClick={() => handleTip(post.id, "0.1")}
        >
          Tip 0.1 Ether
        </Button>
        <Button
          className={classes.button}
          variant="outlined"
          color="primary"
          onClick={() => handleTip(post.id, "0.5")}
        >
          Tip 0.5 Ether
        </Button>
        <Button
          className={classes.button}
          variant="outlined"
          color="primary"
          onClick={() => handleTip(post.id, "1")}
        >
          Tip 1 Ether
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
  const [account, setAccount] = useState("");
  const [decentragram, setDecentragram] = useState(null);
  const [imagesCount, setImagesCount] = useState(0);
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
      setAccount(account);

      const networkId = await web3.eth.net.getId();
      const networkData = Decentragram.networks[networkId];

      if (networkData) {
        const decentragram = new web3.eth.Contract(
          Decentragram.abi,
          networkData.address
        );
        setDecentragram(decentragram);
        const imagesCount = await decentragram.methods.imageCount().call();
        setImagesCount(imagesCount);
        for (var i = 1; i <= imagesCount; i++) {
          const image = await decentragram.methods.images(i).call();
          setPosts([...posts, image]);
        }
      } else {
        window.alert("Decentragram contract not deployed to detected network.");
      }
    } else {
      window.alert("Please install MetaMask!");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    // const newPost = {
    //   id: Date.now(),
    //   image: URL.createObjectURL(file),
    //   description: description,
    //   likes: 0,
    //   comments: [],
    // };
    // setPosts([...posts, newPost]);

    // const reader = new window.FileReader();
    // reader.readAsArrayBuffer(file);
    // const buffer = null;
    // reader.onloadend = () => {
    //   buffer = reader.result;
    //   console.log("buffer", buffer);
    // };

    try {
      // const result = await ipfs.add(buffer);
      // console.log("Ipfs result", result);

      decentragram.methods
        .uploadPost("test", description)
        .send({ from: account });
    } catch (error) {
      console.error(error);
    }

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
      <Typography variant="h5" align="center" gutterBottom>
        Account Hash: {account}
      </Typography>
      <form className={classes.form} onSubmit={handlePostSubmit}>
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
        <input
          className={classes.input}
          type="file"
          onChange={handleFileUpload}
          id="upload-image"
        />
        {file == null ? (
          <div>wait for uploading</div>
        ) : (
          <div>File Name: {file.name}</div>
        )}
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
            <Post
              decentragram={decentragram}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default App;
