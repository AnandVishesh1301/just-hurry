import { Image, StyleSheet, Platform, View, TouchableOpacity, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.helpText}> Press this button for help! </Text>
      <View>
      <TouchableOpacity style={buttonStyle.container}>
        <Text style={buttonStyle.text}>EMERGENCY</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    flexDirection: 'column',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

const buttonStyle = StyleSheet.create({
  container: {
    backgroundColor: '#FF0000', // Bright red for emergency
    width: 200,
    height: 200,
    borderRadius: 100, // Circle button
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // Add shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8, // Elevation for Android
  },
  text: {
    color: '#FFFFFF', // White text
    fontSize: 24, // Large text for readability
    fontWeight: 'bold',
    letterSpacing: 2, // Slight spacing for emphasis
  },
});
