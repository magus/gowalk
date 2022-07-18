# gowalk
messing with apple healthkit to simulate walking

# plan

- promisify `AppleHealthKit.initHealthKit` and `AppleHealthKit.saveSteps`

- background tasks are out (not easily possible)
- instead we will capture a start time and store in a local db
- render a timer that shows distance walked
- periodically (when app is open) write out steps / healthkit activity

- app user flow
  - open app, select egg, adjust distance if necessary (e.g. 2.3/10km)
  - backwards calculate time to walk remaining distance i.e. ~7.7km
  - create timer displaying walk progress, animated bar or something
  - setup a future notification to alert phone/user when finished walking
  - while app is active, periodically log walking activity in 1-10 min intervals or something


# building

adhoc build

```
eas build --profile adhoc --platform ios
```

development build

```
eas build --profile development --platform ios
```
# development

```
yarn ios
```

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

# looks like we will want to follow this guide for setting up custom native code
# it first has us use expo run:ios like above to build the project
# then it guides us through using expo-dev-client (to go back to fast JS fast refresh workflow)
# and then finally using eas build to create builds that run on devices
# https://docs.expo.dev/workflow/customizing/

expo run:ios
# 🎉 working!!
# all good after updating to macOS 12.4 & Xcode 13.4.1
```

settings up eas build
> https://docs.expo.dev/development/build/

```sh
yarn global add eas-cli
eas build:configure

# prompted for a login, logged in with existing expo account
# created an eas.json file

# added `"developmentClient": true,` under `build.development` in `eas.json`
# according to docs settings this will create a Debug build, which allows the
# expo-dev-client library to allow you to choose the update to load in your app
# and provide tools to help you developthis enables for development builds

# now running below command to setup for ios builds
eas device:create

# prompts for my apple developer account credentials (probably doing what match does)
# generated qr code to url that goes through setup instructions on devices
# added uuids of a few personal devices

# build command to create a build for internal distribution
eas build --profile development --platform ios

# ah ok so it stops me here and prompts me to install `expo-dev-client` nice
# was wondering when that would come into play
```

> Starting with `expo-dev-client` on a new expo project
> https://docs.expo.dev/development/installation/
> Manually adding `expo-dev-client` to existing project
> https://docs.expo.dev/development/getting-started/

```sh
expo install expo-dev-client
```

Adding import to top of `App.js` for better error messages

```js
import 'expo-dev-client';
```

... and the instructions loop back and have us run the command below
which should not be good to proceed since we installed `expo-dev-client`

```sh
eas build --profile development --platform ios

# cli is really good, prompting through various setup options
# selecting devices (uuids registered earlier)
# setting up push notifications (creating push keys)
```

Build finished and installedo on phone but requires a development server.
Okay that makes sense this is a development build it didn't ship with a JS bundle it relies on a server just like when we run locally.
Going to run the command below to spin up a dev client server and see if I can connect the build on the iOS device to my local machine

```sh
yarn start
```

🎉 It worked! Scanning QR code on iOS device opened in the development app on device
Pretty smooth developer experience, nice.
