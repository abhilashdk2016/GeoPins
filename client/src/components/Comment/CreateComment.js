import React, { useState, useContext } from "react";
import { withStyles } from "@material-ui/core";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from "@material-ui/icons/Send";
import Divider from "@material-ui/core/Divider";
import { CREATE_COMMENT_MUTATAION } from '../../graphql/mutations';
import { useClient } from '../../client';
import Context from '../../context';

const CreateComment = ({ classes }) => {
  const client = useClient();
  const { state } = useContext(Context);
  const [ comment, setComment ] = useState("");
  const variables = {
    pinId: state.currentPin._id,
    text: comment
  }
  const handleSubmitComment = async () => {
    await client.request(CREATE_COMMENT_MUTATAION, variables);
    setComment("");
  }
  return (
    <>
      <form className={classes.form}>
        <IconButton className={classes.clearButton} disabled={!comment.trim()} onClick={e => setComment("")} >
          <ClearIcon />
        </IconButton>
        <InputBase multiline={true} 
          className={classes.input} 
          placeholder="Add Comment" 
          onChange={e => setComment(e.target.value)} 
          value={comment} />
        <IconButton className={classes.sendButton} disabled={!comment.trim()} onClick={handleSubmitComment}>
          <SendIcon />
        </IconButton>
      </form>
      <Divider />
    </>
  )
};

const styles = theme => ({
  form: {
    display: "flex",
    alignItems: "center"
  },
  input: {
    marginLeft: 8,
    flex: 1
  },
  clearButton: {
    padding: 0,
    color: "red"
  },
  sendButton: {
    padding: 0,
    color: theme.palette.secondary.dark
  }
});

export default withStyles(styles)(CreateComment);
