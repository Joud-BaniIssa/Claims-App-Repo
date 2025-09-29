# Insurance App Development Rules

## Tech Stack
- Angular 17+ with standalone components
- TypeScript strict mode
- SCSS with CSS custom properties
- Angular Material for UI components
- RxJS for state management

## Coding Standards
- Use OnPush change detection strategy
- Implement proper TypeScript interfaces
- Follow Angular style guide
- Use services with BehaviorSubject for state
- Implement loading and error states

## Project Structure
- Core features in /src/app/features/
- Shared components in /src/app/shared/
- Services in /src/app/core/services/
- Mock data using HTTP interceptors

## Current Priority
1. Set up PWA configuration
2. Implement HTTP interceptors for mock APIs
3. Build claim filing workflow
4. Add bilingual support (English/Arabic)