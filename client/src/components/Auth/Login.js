import React, { useContext } from "react";
import { GraphQLClient } from 'graphql-request';
import { GoogleLogin } from 'react-google-login';
import { withStyles } from "@material-ui/core/styles";
import Context from '../../context';
import Typography from "@material-ui/core/Typography";
import { ME_QUERY } from '../../graphql/queries';

const Login = ({ classes }) => {
  const { dispatch } = useContext(Context);

  const onSuccess = async googleUser => {
    try {
      const id_token = googleUser.getAuthResponse().id_token;
      const client = new GraphQLClient('http://localhost:4000/graphql', {
        headers: { authorization: id_token }
      });
      const { me } = await client.request(ME_QUERY);
      dispatch({type: 'LOGIN_USER', payload: me });
      dispatch({ type: 'IS_LOGGED_IN', payload: googleUser.isSignedIn() })
    } catch(error) {
      onFailure(error);
    }
  }

  const onFailure = err => {
    console.error("Error during Login ", err);
    dispatch({ type: 'IS_LOGGED_IN', payload: false });
  }
  return <div className={classes.root}>
    <Typography
      component="h1"
      variant="h3"
      gutterBottom
      noWrap
      style={{color: "rgb(66,133, 244) "}}
    >
      Welcome
    </Typography>
    <GoogleLogin  isSignedIn={true} theme="dark"
                  clientId="905353362055-j9vm9jt0q57qbdg07cgksii945j219k5.apps.googleusercontent.com" 
                  onSuccess={onSuccess} onFailure={onFailure} 
                  buttonText="Login with Google"
                  />
  </div>
};

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default withStyles(styles)(Login);
