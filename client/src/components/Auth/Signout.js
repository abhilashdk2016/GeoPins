import React, { useContext } from "react";
import { withStyles } from "@material-ui/core/styles";
import { GoogleLogout } from 'react-google-login';
import ExitToApp from "@material-ui/icons/ExitToApp";
import Typography from "@material-ui/core/Typography";
import Context from '../../context';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

const Signout = ({ classes }) => {
  const { dispatch } = useContext(Context);
  const mobileSize = useMediaQuery('(max-width: 650px)');

  const onSignOut = () => {
    dispatch({ type: 'SIGNOUT_USER' });
  }

  return <GoogleLogout onLogoutSuccess={onSignOut}
    render={({ onClick }) => (
      <span className={classes.root} onClick={onClick}>
        <Typography variant="body1" className={classes.buttonText} style={{display: mobileSize ? "none" : "block" }}>
          Sign Out
        </Typography>
        <ExitToApp className={classes.buttonIcon} />
      </span>
    )}
  />
};

const styles = {
  root: {
    cursor: "pointer",
    display: "flex"
  },
  buttonText: {
    color: "orange"
  },
  buttonIcon: {
    marginLeft: "5px",
    color: "orange"
  }
};

export default withStyles(styles)(Signout);
