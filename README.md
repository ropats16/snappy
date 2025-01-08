# Snappy

A camera app that uploads your photos directly to the Arweave.

## Features

### Camera Controls

- **Camera Toggle**: Enable/disable camera access using the switch in the top-left corner
- **Camera Switch**: Toggle between front and back cameras using the button in the top-right corner
- **Capture Button**: Large circular button in the center to take photos
- **Gallery Access**: View your uploaded photos using the gallery icon in the bottom-left corner

### Image Management

- **Review**: After capturing, review your photo before uploading
- **Upload**: Upload your photo directly to Arweave
- **Cancel**: Discard the captured photo and return to camera preview
- **Gallery View**: Grid view of all your uploaded photos with expandable view

## Important Notes

### Permissions Required

The app will request permissions at different stages:

- **Camera Access**: When enabling the camera toggle
- **Wallet Access**: When viewing gallery (to fetch your uploads)
- **Transaction Signing**: When uploading photos to Arweave
  Each permission request requires explicit user approval for security reasons.

### Beta Status

- The app is currently in beta
- All uploaded images are public on the Arweave
- Uploads are chargeable as they are stored permanently on Arweave
- Working on adding bundling support and fixing bugs

### Known Issues

- Due to browser limitations, the camera indicator light may remain on even after disabling the camera. In the meantime you can close the app to close the camera
- App disclaimer needs to be agreed to each time the camera is enabled
- Some browsers may handle camera access differently
- Permission requests may need to be re-approved when revisiting features

### Privacy & Security

- The developer (aka me) is not responsible for sensitive data uploads
- All images uploaded are permanent and public
- Exercise caution when uploading personal or sensitive content

## Browser Support

- Intended to work in ArConnect App Store
- Works with regular browsers too where web signing is supported

## Feedback

Have suggestions or found a bug? Reach out on [X/Twitter](https://x.com/ropats16/)

## Technical Requirements

- ArConnect extension required for uploads
- Camera and microphone permissions required for capture
- Stable internet connection recommended for uploads
