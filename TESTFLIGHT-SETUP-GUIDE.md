# TestFlight Setup Guide - Get Silver Edge on Your Phone (FREE)

## Overview
TestFlight allows you to install your app on your iPhone for free testing before deciding whether to pay for App Store publication.

## Step 1: Create Free Apple Developer Account

1. **Go to [developer.apple.com](https://developer.apple.com)**
2. **Sign in** with your Apple ID (the same one you use for App Store)
3. **Accept the Apple Developer Agreement**
4. **Verify your email** if prompted

✅ **This is completely FREE** - no $99 payment required for TestFlight

## Step 2: Create Expo Account (FREE)

1. **Go to [expo.dev](https://expo.dev)**
2. **Sign up** with your email or GitHub
3. **Verify your email**

## Step 3: Configure EAS Build

In your terminal, run these commands one by one:

```bash
# Login to Expo (use the account you just created)
eas login

# Initialize EAS in your project
eas build:configure

# Create iOS build for TestFlight
eas build --platform ios --profile preview
```

**When prompted:**
- **Bundle identifier**: Use `com.silveredge.app` (already set)
- **Apple ID**: Use your Apple ID email
- **Apple Team ID**: EAS will help you find this

## Step 4: Build Configuration

EAS will create an `eas.json` file. Here's what it should look like:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

## Step 5: Start the Build

```bash
# This will build your app in the cloud (takes 10-20 minutes)
eas build --platform ios --profile preview
```

**What happens:**
- EAS builds your app on their servers
- Creates an `.ipa` file (iPhone app)
- Automatically uploads to TestFlight
- Sends you an email when ready

## Step 6: Install TestFlight App

1. **Download TestFlight** from the App Store on your iPhone
2. **Sign in** with the same Apple ID you used for the developer account

## Step 7: Install Your App

1. **Check your email** for TestFlight invitation
2. **Tap the link** in the email on your iPhone
3. **Install Silver Edge** through TestFlight
4. **Test your app!** 🎉

## Step 8: Share with Friends/Family (Optional)

In TestFlight, you can:
- **Add up to 100 beta testers**
- **Send them invitation links**
- **Get feedback and crash reports**
- **Push updates easily**

## Troubleshooting

### Common Issues:

**"No Apple Developer Account"**
- Make sure you signed up at developer.apple.com (free)
- Use the same Apple ID throughout the process

**"Bundle ID already exists"**
- Change bundle ID in app.json to something unique like `com.yourname.silveredge`

**"Build failed"**
- Check the build logs in EAS dashboard
- Usually related to certificates or bundle ID conflicts

**"Can't find app in TestFlight"**
- Check spam folder for invitation email
- Make sure you're using the same Apple ID
- Wait up to 30 minutes for processing

## Costs Breakdown

| Service | Cost | What You Get |
|---------|------|--------------|
| **Apple Developer (Free)** | $0 | TestFlight access, development |
| **Expo EAS Build** | $0 | First 30 builds/month free |
| **TestFlight Distribution** | $0 | Up to 100 beta testers |
| **Total for Testing** | **$0** | Full app testing capability |

## Timeline

- **Setup**: 30 minutes
- **First build**: 20-30 minutes
- **TestFlight processing**: 5-10 minutes
- **Total**: ~1 hour to app on your phone

## Next Steps After Testing

Once you've tested the app and are happy with it:

1. **Gather feedback** from beta testers
2. **Fix any issues** found during testing
3. **Decide if you want to publish** to App Store ($99/year)
4. **Or continue with TestFlight** for personal/family use (free)

## Commands Summary

```bash
# Install tools (already done)
npm install -g @expo/cli eas-cli

# Login and configure
eas login
eas build:configure

# Build for TestFlight
eas build --platform ios --profile preview

# Check build status
eas build:list

# Submit to TestFlight (after build completes)
eas submit --platform ios
```

## Benefits of TestFlight Testing

✅ **Free way to test** your app on real devices  
✅ **Share with family/friends** for feedback  
✅ **No App Store review** required  
✅ **Easy updates** - just rebuild and testers get notified  
✅ **Crash reporting** and analytics  
✅ **Test before investing** in App Store publication  

---

**Ready to see Silver Edge on your iPhone?** Follow the steps above and you'll have your app running in about an hour! 📱
