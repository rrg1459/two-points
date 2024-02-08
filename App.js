import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

import MapView, { Marker } from 'react-native-maps';

import * as Location from 'expo-location';

export default function App() {
  const [position, setPosition] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest, maximumAge: 10000 });

      setPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const onRegionChange = region => {
    setPosition({
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    })
  };

  const viewCoordinates = () => {
    console.log('xxx latitude-->: ', position.latitude);
    console.log('xxx longitude-->: ', position.longitude);
  };

  if (position.latitude === 0) {
    return (
      <View style={[styles.container, styles.vertical]}>
        <Text>LOADING...</Text>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={position}
        onRegionChangeComplete={onRegionChange}
      >
        {console.log(new Date().toLocaleString().split(' ')[1])}
        <Marker
          coordinate={{
            latitude: position.latitude,
            longitude: position.longitude
          }}
          tracksViewChanges={true}>
        </Marker>
        {origin &&
          <Marker
            coordinate={origin}
            title="origin"
            tracksViewChanges={true}
          >
          </Marker>
        }
        {destination &&
          <Marker
            coordinate={destination}
            title="destination"
            tracksViewChanges={true}
          >
          </Marker>
        }
      </MapView>
      {!origin && !destination &&
        <View style={styles.seeCoordinates}>
          <Button title="mark origin" onPress={() => setOrigin(position)} />
        </View>
      }
      {origin &&
        <View style={styles.seeCoordinates}>
          <Button title="mark origin" onPress={() => setOrigin(position)} />
          <Button title="mark destination" onPress={() => setDestination(position)} />
        </View>
      }
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vertical: {
    justifyContent: "space-around",
    padding: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  pickupButton: {
    position: 'absolute',
    top: '90%',
    alignSelf: 'center',
    width: '80%'
  },
  seeCoordinates: {
    position: "absolute",
    top: "90%",
    alignSelf: "center",
    flexDirection: "row",
    gap: 4,
  },
});