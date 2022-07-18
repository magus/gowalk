// improve error messages in dev builds
// https://docs.expo.dev/development/getting-started/
import 'expo-dev-client';

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AppleHealthKit from 'react-native-health';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import * as MMKV from 'react-native-mmkv';

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
    read: [],
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

  const [eggList, set_eggList] = MMKV.useMMKVObject<Egg[]>(KEYS.EggList);

  function handleSetEggList() {
    set_eggList([{ id: 'abc123', meters: 10_000 }]);
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

  return (
    <React.Fragment>
      <StatusBar style="auto" />

      <View style={styles.container}>
        <Text>gowalk</Text>

        <Button title="Set Egg list" onPress={handleSetEggList} />

        <Button title="Random animation!" onPress={randomize_animation} />
        <Animated.View style={[animation_style, styles.animated_view]} />

        <TouchableOpacity onPress={logSteps}>
          <Text>logSteps</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logDistance}>
          <Text>logDistance</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logRunning}>
          <Text>logRunning</Text>
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );
}

function logDistance() {
  let startMs = new Date(2022, 6, 10, 1, 30, 0).getTime();

  const endMs = startMs + 1000 * 60 * 5;
  const endDate = new Date(endMs).toISOString();
  const startDate = new Date(startMs).toISOString();
  const value = 1;
  const unit = AppleHealthKit.Constants.Units.mile;

  AppleHealthKit.saveWalkingRunningDistance({ value, unit, startDate, endDate }, (err, results) => {
    if (err) {
      console.error('AppleHealthKit.saveDistance', { err, results });
      throw err;
    }

    console.debug('AppleHealthKit.saveDistance', { results });
  });
}

function logRunning() {
  let startMs = new Date(2022, 6, 10, 1, 30, 0).getTime();

  for (let i = 0; i < 10; i++) {
    const endMs = startMs + 1000 * 60 * 5;
    const endDate = new Date(endMs).toISOString();
    const startDate = new Date(startMs).toISOString();
    startMs = endMs;

    let options = {
      type: AppleHealthKit.Constants.Activities.Running, // See HealthActivity Enum
      startDate,
      endDate,
      energyBurned: 50, // In Energy burned unit,
      energyBurnedUnit: 'calorie',
      distance: 50, // In Distance unit
      distanceUnit: 'meter',
    };

    AppleHealthKit.saveWorkout(options, (err, results) => {
      if (err) {
        console.error('AppleHealthKit.saveWorkout', { err, results });
        throw err;
      }

      console.debug('AppleHealthKit.saveWorkout', { results });
    });
  }
}

function logSteps() {
  const value = 100;
  const startDate = new Date(2016, 6, 2, 6, 0, 0).toISOString();
  const endDate = new Date(2016, 6, 2, 6, 0, 0).toISOString();

  AppleHealthKit.saveSteps({ value, startDate, endDate }, (err, results) => {
    if (err) {
      console.error('AppleHealthKit.saveSteps', { err, results });
      throw err;
    }

    console.debug('AppleHealthKit.saveSteps', { results });
  });
}

const styles = StyleSheet.create({
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
