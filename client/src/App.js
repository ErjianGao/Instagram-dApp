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

const useStyles = makeStyles((theme) => ({
    root: {
        width: "60%",
        margin: "0 auto",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: theme.spacing(1)
    },
    input: {
        display: "none",
    },
    button: {
        marginTop: theme.spacing(2),
        margin: theme.spacing(1)
    },
    // textField: {
    //     flexGrow: 1
    // },
    card: {
        maxWidth: 600,
        margin: 'auto',
        marginBottom: theme.spacing(2),
        backgroundColor: '#fafafa'
    },
    cardContent: {
        paddingBottom: 0
    },
    image: {
        paddingTop: '100%'
    }
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
    const loadWeb3 = async() => {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.enable()
        }
        else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
          window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
      }
    const loadBlockchainData = async() => {
        const web3 = window.web3
        // Load account
        const accounts = await web3.eth.getAccounts()
        console.log(accounts);
        // Create contract instance
        const networkId = await web3.eth.net.getId();
        const networkData = Decentragram.networks[networkId];
        if (networkData) {
            const contract = new web3.eth.Contract(Decentragram.abi, networkData.address);
            
            // Call the setNumber function
            await contract.methods.setNumber(52).send({ from: accounts[0] });

            // Call the myNumber function to check the updated value
            const myNumber = await contract.methods.myNumber().call();
            console.log('My Number:', myNumber);
        } else {
            window.alert('Decentragram contract not deployed to detected network.');
        }
    }
    useEffect(() => {
        loadWeb3();
        loadBlockchainData();
    }, []);

    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");
    const [posts, setPosts] = useState([]);
    const [highestLikes, setHighestLikes] = useState(0);
    const classes = useStyles();

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
        <Container className={classes.root} >
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