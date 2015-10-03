var React = require('react-native');
var MapboxGLMap = require('react-native-mapbox-gl');
var Icon = require('react-native-vector-icons/Octicons');
var mapRef = 'mapRef';

var {
  AppRegistry,
  StyleSheet,
  Text,
  StatusBarIOS,
  TouchableOpacity,
  View,
} = React;

window.navigator.userAgent = 'react-native';
var io = require('socket.io-client/socket.io');

var MapView = React.createClass({
  mixins: [MapboxGLMap.Mixin],

  getInitialState() {
    this.socket = io('festival-prod.mcfeed.me', {jsonp: false});

    this.socket.on('socketConnected', (data) => {
      console.log('Socket connected: ' + data.socketId);
      this.setState({socketId: data.socketId});
      this.updateUserList(data['onlineUsers']);
    });

    this.socket.on('newLocation', (data) => {
      if (data.location) {
        this.setState({center: data.location.location});
      }
    });

    this.socket.on('onlineUsersUpdated', (data) => {
      this.updateUserList(data['onlineUsers']);
    });

    return {
       center: {
         latitude: 40.72052634,
         longitude: -73.97686958312988
       },
       zoom: 18,
       annotations: []
     };
  },

  updateUserList: function(users) {
    var annotations = [];

    for (key in users) {
      if (users[key] && users[key].location && key !== this.state.socketId) {
        annotations.push({
          latitude: users[key].location.latitude,
          longitude:  users[key].location.longitude,
          title: users[key].name,
          subtitle: 'Online user',
          rightCalloutAccessory: {
              url: 'https://cdn.jsdelivr.net/emojione/assets/png/1F60E.png',
              height: 29,
              width: 29
          },
          annotationImage: {
            url: 'https://cdn.jsdelivr.net/emojione/assets/png/1F60E.png',
            height: 29,
            width: 29
          },
          id: key
        });
      }
    }

    this.setState({annotations: annotations, users: users});
  },

  fitUsers: function() {
    console.log("Bounds: ");
    console.log(this.getBounds());
  },

  findMyLocation: function() {
    var user = this.state.users[this.state.socketId];
    if (user && user.location) {
      this.setCenterCoordinateZoomLevelAnimated(mapRef, user.location.latitude, user.location.longitude, 18);
    }
  },

  render: function() {
    return (
      <View style={styles.container}>
        <MapboxGLMap
          style={styles.map}
          direction={0}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          showsUserLocation={true}
          ref={mapRef}
          accessToken={'sk.eyJ1IjoiZGZtY3BoZWUiLCJhIjoiY2lmNHY3M2RsMDF0ZXM3a3Vmc3k2bHR2MSJ9.5xSTDgtIczsl71AJLnOlzw'}
          styleURL={'asset://styles/streets-v8.json'}
          centerCoordinate={this.state.center}
          zoomLevel={this.state.zoom}
          annotations={this.state.annotations} />
          <TouchableOpacity style={styles.locateButton} onPress={() => this.findMyLocation()}>
            <Icon name="broadcast" size={22} color={palette.blue} />
          </TouchableOpacity>
      </View>
    );
  }
});

var palette = {
  blue: "#0081ff"
}

var styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1
  },
  map: {
    flex: 5
  },
  locateButton: {
    padding: 2,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 5,
    right: 50
  }
});

module.exports = MapView;