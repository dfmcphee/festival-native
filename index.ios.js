/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');

var {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
} = React;

var BackgroundGeolocation = require('react-native-background-geolocation');

window.navigator.userAgent = 'react-native';

var io = require('socket.io-client/socket.io');

var MapView = require('./MapView');
var JoinView = require('./JoinView');

var STORAGE_KEY = '@AsyncStorageName:key';

var festival = React.createClass({
  getInitialState() {
    return {
      users: {},
      joined: false
    }
  },

  componentWillMount() {
    this.socket = io('festival-prod.mcfeed.me', {jsonp: false});

    BackgroundGeolocation.configure({
      desiredAccuracy: 0,
      stationaryRadius: 50,
      distanceFilter: 10,
      activityType: 'OtherNavigation'
    });

    // This handler fires whenever bgGeo receives a location update.
    BackgroundGeolocation.on('location', (location) => {
      console.log('- [js]location: ', JSON.stringify(location));
      this.socket.emit('locate', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    });

    // This handler fires when movement states changes (stationary->moving; moving->stationary)
    BackgroundGeolocation.on('motionchange', (location) => {
      console.log('- [js]motionchanged: ', JSON.stringify(location));
      this.socket.emit('locate', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    });

    BackgroundGeolocation.start(function() {
      console.log('- [js] BackgroundGeolocation started successfully');

      // Fetch current position
      BackgroundGeolocation.getCurrentPosition(function(location) {
        console.log('- [js] BackgroundGeolocation received current position: ', JSON.stringify(location));
      });
    });

    this._loadInitialState().done();
  },

  _stopBackgroundGeolocation() {
    BackgroundGeolocation.stop();
  },

  async _loadInitialState() {
    try {
      var name = await AsyncStorage.getItem(STORAGE_KEY);
      if (name && name !== null) {
        this.socket.emit('identify', name);
        this.setState({name: name, joined: true});
      }
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  },

  join: function(name) {
    this._changeName(name);
  },

  async _changeName(name) {
    this.socket.emit('identify', name);
    this.setState({name: name, joined: true});

    try {
      await AsyncStorage.setItem(STORAGE_KEY, name);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  },

  render: function() {
    if (this.state.joined) {
      return (
        <MapView users={this.state.users}/>
      );
    }
    else {
      return (
        <JoinView socket={this.socket} join={this.join}/>
      );
    }
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('festival', () => festival);
