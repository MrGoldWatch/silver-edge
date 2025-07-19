# Silver Edge - Coin Roll Hunting Tracker

A comprehensive mobile application for coin roll hunters to track their silver coin discoveries, analyze success rates, and manage bank branch visits.

## 🚀 Version 2.0.0 - Cloud Integration
- Full cloud backend integration with Railway
- PostgreSQL database for data persistence
- Real-time hunt tracking and statistics
- TestFlight distribution ready
- GitHub Actions CI/CD pipeline

## 🪙 Overview

Silver Edge helps coin roll hunters maintain detailed records of their hunting expeditions, track silver coin finds across different denominations, and analyze their success patterns over time. Built with React Native and Expo for cross-platform compatibility.

## ✨ Features

### Core Functionality
- **Hunt Tracking**: Record visits to different bank branches with precise details
- **Multi-Denomination Support**: Track dimes, quarters, and half dollars separately
- **Silver Discovery Logging**: Record exact counts of silver coins found
- **Bank Branch Management**: Save and reuse bank locations with GPS integration
- **Statistical Analysis**: View success rates, total coins checked, and silver found
- **Editable Records**: Update hunt results as you process your finds

### User Experience
- **Intuitive Interface**: Clean, professional design optimized for mobile
- **Offline-First**: All data stored locally for privacy and reliability
- **Smart Defaults**: Pre-configured coin counts per roll for each denomination
- **Flexible Data Entry**: Optional fields allow quick entry or detailed logging
- **Progress Tracking**: All-time and weekly statistics views

## 🏗️ Technical Stack

### Frontend
- **React Native 0.79.5**: Cross-platform mobile development
- **Expo SDK 53**: Development tooling and native module access
- **TypeScript**: Type-safe development with enhanced IDE support
- **React Hooks**: Modern state management and lifecycle handling

### Data & Storage
- **AsyncStorage**: Local data persistence (Phase 1)
- **JSON-based**: Structured data storage with migration support
- **Privacy-First**: No cloud storage, all data remains on device

### Location Services
- **Expo Location**: GPS integration for bank branch mapping
- **Permission Management**: Proper iOS/Android location permission handling

### Development Tools
- **Expo CLI**: Development server and build tools
- **Metro Bundler**: JavaScript bundling and hot reload
- **React Native Debugger**: Development debugging tools

## 📱 Platform Support

- **iOS**: iPhone and iPad (iOS 13+)
- **Android**: Android 6.0+ (API level 23+)
- **Web**: Progressive Web App capability

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Expo CLI

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd SilverEdgeTS

# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 📊 Data Structure

### Hunt Record
```typescript
interface Hunt {
  id: string;
  bankName: string;
  branchName?: string;
  branchAddress?: string;
  date: string;
  denominations: DenominationEntry[];
  isProcessed: boolean;
  lastUpdated?: string;
}
```

### Denomination Entry
```typescript
interface DenominationEntry {
  denomination: 'Dimes' | 'Quarters' | 'Halves';
  numberOfRolls: number;
  coinsPerRoll: number;
  totalCoinsChecked: number;
  silverCoinsFound: number;
  isProcessed: boolean;
  processingNotes?: string;
}
```

## 🎯 Development Phases

### Phase 1: Local App (Current)
- ✅ Complete hunt tracking functionality
- ✅ Local data storage with AsyncStorage
- ✅ Professional UI/UX design
- ✅ iOS Simulator testing
- ✅ App Store ready (pending submission)

### Phase 2: Cloud Integration (Future)
- 🔄 User authentication system
- 🔄 PostgreSQL database on Railway
- 🔄 Data synchronization across devices
- 🔄 Advanced analytics and reporting
- 🔄 Social features and community sharing

## 🏛️ Architecture Decisions

### Local-First Approach
**Decision**: Store all data locally using AsyncStorage
**Rationale**: 
- Privacy-focused (no personal data leaves device)
- Offline reliability
- Faster time to market
- No server costs for Phase 1
- User owns their data completely

### TypeScript Implementation
**Decision**: Full TypeScript adoption
**Rationale**:
- Type safety reduces runtime errors
- Better IDE support and autocomplete
- Easier refactoring and maintenance
- Self-documenting code

### Expo Framework
**Decision**: Use Expo instead of bare React Native
**Rationale**:
- Simplified development workflow
- Built-in access to native APIs
- Easy deployment and testing
- Over-the-air updates capability

### Monorepo Structure
**Decision**: Single repository for all code
**Rationale**:
- Simplified development for single developer
- Shared TypeScript types between frontend/backend
- Easier version control and deployment
- Phase 2 backend can be added seamlessly

## 📋 App Store Readiness

### Completed Requirements
- ✅ Professional app name and branding
- ✅ App icons and visual assets (1024x1024)
- ✅ Privacy policy and terms of service
- ✅ Comprehensive app description and keywords
- ✅ User experience polish and onboarding
- ✅ Error handling and edge cases
- ✅ iOS build and testing capability

### Submission Checklist
- 📋 Apple Developer Account ($99/year)
- 📋 App Store Connect configuration
- 📋 Screenshots for required device sizes
- 📋 Host privacy policy on website
- 📋 Final build and upload

## 🧪 Testing Strategy

### Current Testing
- ✅ iOS Simulator testing (iPhone 16 Pro)
- ✅ Manual feature testing
- ✅ Edge case validation
- ✅ Performance verification

### Future Testing
- 🔄 Physical device testing
- 🔄 TestFlight beta testing
- 🔄 Automated unit tests
- 🔄 Integration testing

## 📈 Success Metrics

### Phase 1 Goals
- App Store approval
- Positive user reviews (4+ stars)
- Organic download growth
- User retention and engagement

### Phase 2 Goals
- User authentication adoption
- Cloud sync usage
- Advanced feature utilization
- Community engagement

## 🤝 Contributing

This is currently a solo project, but contributions are welcome for:
- Bug fixes and improvements
- Feature suggestions
- Documentation updates
- Testing and feedback

## 📄 License

[License information to be added]

## 🙏 Acknowledgments

- React Native and Expo teams for excellent development tools
- Coin roll hunting community for inspiration and feedback
- Open source contributors for the libraries used

---

**Silver Edge** - Turning coin roll hunting into a data-driven hobby! 🪙📊
