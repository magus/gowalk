import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from "react-native-health";

/* Permission options */
const permissions = {
  permissions: {
    read: [],
    write: [AppleHealthKit.Constants.Permissions.Steps],
  },
};

export default function App() {
  React.useEffect(() => {
    AppleHealthKit.initHealthKit(permissions, (err) => {
      /* Called after we receive a response from the system */
      console.debug("AppleHealthKit.initHealthKit", { err, permissions });

      if (err) {
        throw err;
      }

      /* Can now read or write to HealthKit */
    });
  }, []);

  return (
    <React.Fragment>
      <StatusBar style="auto" />

      <View style={styles.container}>
        <Text>gowalk</Text>

        <TouchableOpacity onPress={logSteps}>
          <Text>logSteps</Text>
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );
}

function logSteps() {
  const value = 100;
  const startDate = new Date(2016, 6, 2, 6, 0, 0).toISOString();
  const endDate = new Date(2016, 6, 2, 6, 0, 0).toISOString();

  AppleHealthKit.saveSteps({ value, startDate, endDate }, (err, results) => {
    if (err) {
      console.error("logSteps", { err, results });
      throw err;
    }

    console.debug("logSteps", { results });
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
