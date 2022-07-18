// improve error messages in dev builds
// https://docs.expo.dev/development/getting-started/
import 'expo-dev-client';

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, Button, StyleSheet, Text, View } from 'react-native';
import AppleHealthKit from 'react-native-health';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import * as MMKV from 'react-native-mmkv';
import * as Notifications from 'expo-notifications';

// set the handler that will cause the notification to show the alert
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const storage = new MMKV.MMKV();

const KEYS = Object.freeze({
  EggList: 'EggList',
});

storage.set(KEYS.EggList, JSON.stringify([]));

interface Egg {
  id: string;
  meters: number;
}

/* react-native-health options */
const permissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.DistanceWalkingRunning, AppleHealthKit.Constants.Permissions.Steps],
    write: [AppleHealthKit.Constants.Permissions.Steps, AppleHealthKit.Constants.Permissions.DistanceWalkingRunning],
  },
};

export default function App() {
  React.useEffect(() => {
    AppleHealthKit.initHealthKit(permissions, (err) => {
      /* Called after we receive a response from the system */
      console.debug('AppleHealthKit.initHealthKit', { err, permissions });

      if (err) {
        throw err;
      }

      /* Can now read or write to HealthKit */
    });
  }, []);

  React.useEffect(() => {
    registerNotificationPermissions();
  }, []);

  const [eggList, set_eggList] = MMKV.useMMKVObject<Egg[]>(KEYS.EggList);

  function handleSetEggList() {
    set_eggList([{ id: 'abc123', meters: 10 * 1000 }]);
  }

  console.debug({ eggList });

  // reanimated animatiosn are slick
  // https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/shared-values
  const animation = useSharedValue(0);
  function randomize_animation() {
    const sign = Math.random() < 0.5 ? -1 : +1;
    const value = sign * Math.random();
    animation.value = withSpring(value);
  }
  const animation_style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: 90 * animation.value }],
    };
  });

  async function handleNotify() {
    const title = 'Notification title';
    const body = 'Notification body';
    const seconds = 5;

    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { seconds },
    });

    console.debug('handleNotify', { id });
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="auto" />

      <View style={styles.container}>
        <Text>gowalk</Text>

        <Button title="Notify in 5 seconds" onPress={handleNotify} />

        <Button title="Set Egg list" onPress={handleSetEggList} />

        <Button title="Random animation!" onPress={randomize_animation} />
        <Animated.View style={[animation_style, styles.animated_view]} />

        <Button title="getSamples" onPress={getSamples} />

        <Button title="simulateRun" onPress={simulateRun} />

        <Button title="logSteps" onPress={logSteps} />

        <Button title="logDistance" onPress={logDistance} />
      </View>
    </SafeAreaView>
  );
}

function getSamples() {
  const now = new Date().getTime();
  const seconds = 60 * 30;
  const startMs = now - 1000 * seconds;
  const endMs = startMs + 1000 * seconds;
  const endDate = new Date(endMs).toISOString();
  const startDate = new Date(startMs).toISOString();

  let options = {
    startDate,
    endDate,
    // one of: ['Walking', 'StairClimbing', 'Running', 'Cycling', 'Workout']
    type: AppleHealthKit.Constants.Observers.Walking,
  };

  AppleHealthKit.getSamples(options, (err: Object, results: Array<Object>) => {
    if (err) {
      console.error('AppleHealthKit.getSamples', { err, results });
      throw err;
    }

    console.debug('AppleHealthKit.getSamples', { results });
  });
}

function simulateRun() {
  const now = new Date().getTime();

  const seconds = 60;
  const startMs = now - 1000 * seconds;
  const endMs = startMs + 1000 * seconds;

  const endDate = new Date(endMs).toISOString();
  const startDate = new Date(startMs).toISOString();

  const meters_per_sec = 6 + Math.random() * 1.5;
  const distance_meters = meters_per_sec * seconds;
  const steps_per_meter = 0.7 + Math.random();
  const steps = Math.floor(steps_per_meter * distance_meters);

  console.debug({ meters_per_sec, distance_meters, steps_per_meter, steps });

  AppleHealthKit.saveWalkingRunningDistance({ value: distance_meters, startDate, endDate }, (err, results) => {
    if (err) {
      console.error('AppleHealthKit.saveDistance', { err, results });
      throw err;
    }

    console.debug('AppleHealthKit.saveDistance', { results });
  });

  AppleHealthKit.saveSteps({ value: steps, startDate, endDate }, (err, results) => {
    if (err) {
      console.error('AppleHealthKit.saveSteps', { err, results });
      throw err;
    }

    console.debug('AppleHealthKit.saveSteps', { results });
  });
}

function logDistance() {
  const now = new Date().getTime();

  const startMs = now - 1000 * 30;
  const endMs = startMs + 1000 * 30;

  const endDate = new Date(endMs).toISOString();
  const startDate = new Date(startMs).toISOString();

  const value = 100;

  AppleHealthKit.saveWalkingRunningDistance({ value, startDate, endDate }, (err, results) => {
    if (err) {
      console.error('AppleHealthKit.saveDistance', { err, results });
      throw err;
    }

    console.debug('AppleHealthKit.saveDistance', { results });
  });
}

function logSteps() {
  const now = new Date().getTime();

  const startMs = now - 1000 * 30;
  const endMs = startMs + 1000 * 30;

  const endDate = new Date(endMs).toISOString();
  const startDate = new Date(startMs).toISOString();

  const value = 100;

  AppleHealthKit.saveSteps({ value, startDate, endDate }, (err, results) => {
    if (err) {
      console.error('AppleHealthKit.saveSteps', { err, results });
      throw err;
    }

    console.debug('AppleHealthKit.saveSteps', { results });
  });
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  animated_view: {
    width: 180,
    height: 90,
    backgroundColor: 'orange',
  },
});

// https://docs.expo.dev/versions/v45.0.0/sdk/notifications/#api
async function registerNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
}
