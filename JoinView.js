var React = require('react-native');
var MapboxGLMap = require('react-native-mapbox-gl');
var Icon = require('react-native-vector-icons/Octicons');
var mapRef = 'mapRef';

var {
  AppRegistry,
  StyleSheet,
  Text,
  StatusBarIOS,
  TextInput,
  TouchableOpacity,
  View,
} = React;

var JoinView = React.createClass({
  mixins: [MapboxGLMap.Mixin],

  getInitialState() {
    return {
      name: ''
    };
  },

  render: function() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.nameInput}
          onChangeText={(name) => this.setState({name: name})}
          value={this.state.name}
        />
        <TouchableOpacity style={styles.joinButton} onPress={() => this.props.join(this.state.name)}>
          <Text>Join</Text>
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
    flex: 1,
    marginTop: 20,
    padding: 20
  },
  nameInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1
  },
  joinButton: {
    paddingTop: 30,
    backgroundColor: 'transparent'
  }
});

module.exports = JoinView;
