# gowalk
messing with apple healthkit to simulate walking


# setup

```zsh
# installed fnm for lts node 16
curl -fsSL https://fnm.vercel.app/install | bash
fnm install 16

# follow install instructions here
# https://docs.expo.dev/get-started/installation/
yarn global add expo-cli
yarn create expo-app gowalk
cd gowalk
rm -rf .git
cd ..
mv gowalk/* .
expo start

# now installing react-native-health, third party library
# https://github.com/agencyenterprise/react-native-health/blob/master/docs/Expo.md#expo-installation
expo install react-native-health
# command above added 'react-native-health' to `app.json:expo.plugins`
expo run:ios
# 🚨 ERROR due to post_integrate being undefined, outdated cocoapods?
#    trying to update cocoapods
sudo gem install cocoapods
# try expo run again
expo run:ios
# hmmm now it's long running an 'Installing CocoaPods...' step
# finished but ended with another failure during build
# ❌  (node_modules/react-native/React/Views/RCTDatePickerManager.m:37:21)

#   35 |       @"compact" : @(UIDatePickerStyleCompact),
#   36 |       @"spinner" : @(UIDatePickerStyleWheels),
# > 37 |       @"inline" : @(UIDatePickerStyleInline),
#      |                     ^ use of undeclared identifier 'UIDatePickerStyleInline'; did you mean 'UIDatePickerStyleWheels'?
#   38 |     }),
#   39 |     UIDatePickerStyleAutomatic,
#   40 |     integerValue)
#
# seems like we might need to upgrade Xcode which requires updated OSX to 12 ...
# going to do that...
```
