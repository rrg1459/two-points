import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, View, Text, Modal, Image, Pressable, ActivityIndicator } from "react-native";

import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import * as Location from "expo-location";
import axios from "axios";

export default function App() {

  const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY;

  const [position, setPosition] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [walking, setWalking] = useState(true);
  const [modalVisibleDistance, setModalVisibleDistance] = useState(false);
  const [modalVisibleNoRoutes, setModalVisibleNoRoutes] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
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

  useEffect(() => {
    if (origin && destination) {
      (async () => {
        let distance = await getDistance();
        setCurrentDistance(distance);
      })();
    }
  }, [origin, destination]);

  const onRegionChange = (region) => {
    setPosition({
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    });
  };

  const handleMode = () => setWalking(!walking);
  const seeMode = walking ? "Walking" : "Driving";
  const seeColor = walking ? "hotpink" : "red";

  async function getDistance() {

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_APIKEY}`;

    try {
      const response = await axios.get(url);
      if (response.data.routes.length) {
        const distanceText = response.data.routes[0].legs[0].distance.text;
        return distanceText;
      } else {
        setModalVisibleNoRoutes(true)
        return
      }

    } catch (error) {
      console.error("Error on distance:", error);
    }
  }

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
      <Modal visible={modalVisibleDistance} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.padding}>{`Distance is ${currentDistance}`}</Text>
            <Button title="Close" onPress={() => setModalVisibleDistance(false)} />
          </View>
        </View>
      </Modal>
      <Modal visible={modalVisibleNoRoutes} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.padding}>No routes for this origin y/o destination</Text>
            <Button title="Close" onPress={() => setModalVisibleNoRoutes(false)} />
          </View>
        </View>
      </Modal>
      <MapView
        style={styles.map}
        region={position}
        onRegionChangeComplete={onRegionChange}
      >
        {console.log(new Date().toLocaleString().split(' ')[1])}
        <MapViewDirections
          origin={origin}
          destination={destination}
          mode={seeMode.toUpperCase()}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeColor={seeColor}
          strokeWidth={3}
        />

        {origin !== position && destination !== position &&
          <Marker
            coordinate={{
              latitude: position.latitude,
              longitude: position.longitude
            }}
            tracksViewChanges={true}>
          </Marker>
        }

        {origin &&
          <Marker
            coordinate={origin}
            title="origin"
            tracksViewChanges={true}
          >
            <Image
              // source={{uri: 'https://reactnative.dev/docs/assets/p_cat2.png'}}
              source={{ uri: 'https://t4.ftcdn.net/jpg/01/36/70/67/240_F_136706734_KWhNBhLvY5XTlZVocpxFQK1FfKNOYbMj.jpg' }}
              style={styles.markerImage}
            />
          </Marker>
        }
        {destination &&
          <Marker
            coordinate={destination}
            title="destination"
            tracksViewChanges={true}
          >
            <Image
              source={{ uri: 'https://cdn1.iconfinder.com/data/icons/business-elements-15/150/Zielflagge-512.png' }}
              style={styles.markerImage}
            />
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
      {origin && destination && origin !== destination && currentDistance &&
        <>
          <Pressable style={[styles.button, walking ? styles.green : styles.blue]} onPress={handleMode}>
            <Text style={styles.text}>{seeMode}</Text>
          </Pressable>
          <View style={styles.seeDistance}>
            <Button title="see distance" onPress={() => setModalVisibleDistance(true)} />
          </View>
        </>
      }
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  vertical: {
    justifyContent: "space-around",
    padding: 10,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  green: {
    backgroundColor: "green",
  },
  blue: {
    backgroundColor: "blue",
  },
  padding: {
    paddingBottom: 18,
  },
  button: {
    position: "absolute",
    top: "5%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  seeDistance: {
    position: "absolute",
    top: "85%",
    alignSelf: "center",
  },
  seeCoordinates: {
    position: "absolute",
    top: "90%",
    alignSelf: "center",
    flexDirection: "row",
    gap: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  markerImage: {
    width: 25,
    height: 25
  },
});
