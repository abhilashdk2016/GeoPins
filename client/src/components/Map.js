import React, { useState, useEffect, useContext } from "react";
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
import { withStyles } from "@material-ui/core/styles";
import ReactMapGL, { NavigationControl, Marker, Popup } from 'react-map-gl';
import PinIcon from "./PinIcon";
import Context from "../context";
import Blog from './Blog';
import { Subscription } from 'react-apollo';
import { useClient } from "../client";
import { GET_PINS_QUERY } from "../graphql/queries";
import differenceInMinutes from 'date-fns/difference_in_minutes';
import { closestIndexTo } from "date-fns";
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";
import { DELETE_PIN_MUTATION } from "../graphql/mutations";
import { PIN_ADDED_SUBSCRIPTION, PIN_UPDATED_SUBSCRIPTION, PIN_DELETED_SUBSCRIPTION } from '../graphql/subscriptions';

const initialViewPort = {
  latitude: 37.7577,
  longitude: -122.4376,
  zoom: 13
}

const Map = ({ classes }) => {
  const client = useClient();
  const [viewPort, setViewPort] = useState(initialViewPort);
  const [userPosition, setUserPosition] = useState(null);
  const { state, dispatch } = useContext(Context);
  const [popup, setPopUp] = useState(null);
  const mobileSize = useMediaQuery('(max-width: 650px)');

  useEffect(() => {
    const pinExists = popup && state.pins.findIndex(pin => pin._id === popup._id) > -1;
    if(!pinExists) {
      setPopUp(null);
    }
  }, [state.pins.length]);

  useEffect(() => {
    (
      () => {
        if("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(postition => {
            const { latitude, longitude }  = postition.coords;
            setViewPort({ ...viewPort, latitude, longitude });
            setUserPosition({ latitude, longitude });
          });
        }
      }
    )();
  }, []);

  useEffect(() => {
    (
      async () => {
        const { getPins } = await client.request(GET_PINS_QUERY);
        dispatch({ type: "GET_PINS", payload: getPins });
      }
    )();
  }, []);

  const handleMapClick = ({ lngLat, leftButton }) => {
    if(!leftButton) {
      return
    }
    if(!state.draft) {
      dispatch({ type: 'CREATE_DRAFT' })
    }

    const [longitude, latitude ] = lngLat;

    dispatch({ type: 'UPDATE_DRAFT_LOCATION', payload: { longitude, latitude  }});
  }

  const highlightNewPin = pin => {
    const isNewPin = differenceInMinutes(Date.now(), Number(pin.createdAt)) <= 30;
    return isNewPin ? "limegreen" : "darkblue";
  }

  const handleSelectPin = pin => {
    setPopUp(pin);
    dispatch({ type: "SET_PIN", payload: pin });
  }

  const isAuthUser = () => state.currentUser._id === popup.author._id;

  const handleDeletePin = async pin => {
    const variables = { pinId: pin._id };
    await client.request(DELETE_PIN_MUTATION, variables);
    setPopUp(null)
  }

  return <div className={ mobileSize ? classes.rootMobile: classes.root}>
    <ReactMapGL
      width="100vw"
      height="calc(100vh - 64px)"
      mapStyle="mapbox://styles/mapbox/streets-v9"
      vie
      mapboxApiAccessToken="pk.eyJ1IjoiYWJoaWxhc2hkayIsImEiOiJja3I0cTJlMGYwMnRiMm9teXhpejR5cmFvIn0.DeMbAsaq9LpVbzZs1Z9XaA"
      onViewportChange={newViewport => setViewPort(newViewport)}
      onClick={handleMapClick}
      {...viewPort}
      scrollZoom={!mobileSize}
    >
      <div className={classes.navigationControl}>
        <NavigationControl onViewportChange={newViewport => setViewPort(newViewport)}/>
      </div>
      {userPosition && (
        <Marker
          latitude={userPosition.latitude}
          longitude={userPosition.longitude}
          offsetLeft={-19}
          offsetTop={-37}
        >
          <PinIcon size={40} color="red" />
        </Marker>
      )}
      {state.draft && (
        <Marker
        latitude={state.draft.latitude}
        longitude={state.draft.longitude}
        offsetLeft={-19}
        offsetTop={-37}
      >
        <PinIcon size={40} color="hotpink" />
      </Marker>
      )}
      {/*Created Pin*/}
      {state.pins.map(pin => (
          <Marker key={pin._id}
            latitude={pin.latitude}
            longitude={pin.longitude}
            offsetLeft={-19}
            offsetTop={-37}>
              <PinIcon size={40} color={highlightNewPin(pin)} onClick={() => handleSelectPin(pin)}/>
          </Marker>
        ))
      }

      {/* Popup Dialog for created pins */ }
      {
        popup && (
          <Popup anchor="top" latitude={popup.latitude} longitude={popup.longitude} closeOnClick={false} onClose={() => setPopUp(null)}>
            <img className={closestIndexTo.popupImage} src={popup.image} alt={popup.title} />
            <div className={classes.popupTab}>
              <Typography>
                {popup.latitude.toFixed(6)}, {popup.longitude.toFixed(6)}
              </Typography>
              {
                isAuthUser() && (
                  <Button onClick={() => handleDeletePin(popup)}>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Button>
                )
              }
            </div>
          </Popup>
        )
      }
    </ReactMapGL>
    <Subscription 
      subscription={PIN_ADDED_SUBSCRIPTION}
      onSubscriptionData={({ subscriptionData }) => {
        const { pinAdded } = subscriptionData.data;
        dispatch({ type: "CREATE_PIN", payload: pinAdded });
      }}
    />
    <Subscription 
      subscription={PIN_DELETED_SUBSCRIPTION}
      onSubscriptionData={({ subscriptionData }) => {
        const { pinDeleted } = subscriptionData.data;
        dispatch({ type: "DELETE_PIN" , payload: pinDeleted });
      }}
    />
    <Subscription 
      subscription={PIN_UPDATED_SUBSCRIPTION}
      onSubscriptionData={({ subscriptionData }) => {
        const { pinUpdated } = subscriptionData.data;
        dispatch({ type: 'CREATE_COMMENT', payload: pinUpdated });
      }}
    />
    <Blog />
  </div>;
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "red"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);
