import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import MapViewDirections from "react-native-maps-directions";

import MapView, { Marker } from 'react-native-maps';

import * as Location from 'expo-location';
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

  useEffect(() => {
    if (origin && destination) {
      (async () => {
        let distance = await getDistance();
        setCurrentDistance(distance);
      })();
    }
  }, [origin, destination]);

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

  const handleMode = () => setWalking(!walking);

  async function getDistance() {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_APIKEY}`;

    try {
      const response = await axios.get(url);
      const distanceText = response.data.routes[0].legs[0].distance.text;
      return distanceText;
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
      <MapView
        style={styles.map}
        region={position}
        onRegionChangeComplete={onRegionChange}
      >
        {console.log(new Date().toLocaleString().split(' ')[1])}
        {console.log('xxx GOOGLE_MAPS_APIKEY-->: ', GOOGLE_MAPS_APIKEY)}
        <MapViewDirections
          origin={origin}
          destination={destination}
          mode="WALKING"
          apikey={GOOGLE_MAPS_APIKEY}
          strokeColor="hotpink"
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
  green: {
    backgroundColor: "green",
  },
  blue: {
    backgroundColor: "blue",
  },
  padding: {
    paddingBottom: 18,
  },
  pickupButton: {
    position: 'absolute',
    top: '90%',
    alignSelf: 'center',
    width: '80%'
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