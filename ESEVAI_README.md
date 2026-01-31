# E-Sevai Maiyam Portal

A public-facing portal for e-sevai maiyam staff to verify migrant workers and process renewal approvals using biometric verification.

## Features

- **Staff Authentication**: Secure login for authorized e-sevai maiyam personnel
- **Worker Verification**: Search and verify workers using unique registration numbers
- **Biometric Verification**: Simulated biometric verification (fingerprint + facial recognition)
- **Renewal Processing**: Automatic approval and extension of stay validity
- **Audit Trail**: Complete tracking of all verification and approval activities

## URLs

- **Login Page**: `http://localhost:3000/esevai`
- **Verification Portal**: `http://localhost:3000/esevai/verify`

## Demo Credentials

- **Username**: `esevai`
- **Password**: `admin123`

## How to Use

1. **Login**: Access the portal using the demo credentials
2. **Search Worker**: Enter the worker's unique registration number (format: MIG[timestamp][random])
3. **Verify Identity**: Review worker details and Aadhaar information
4. **Biometric Verification**: Click "Start Biometric Verification" to simulate biometric check
5. **Process Renewal**: Once biometric verification is complete, approve the renewal to extend stay validity by 1 year

## Technical Implementation

- **Frontend**: Next.js 16 with React and TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data Storage**: localStorage (for demo purposes)
- **Authentication**: Simple credential-based auth (demo)
- **Biometric Simulation**: Mock biometric verification process

## Data Flow

1. Worker registers through main admin portal
2. Registration is approved with unique number generation
3. Worker visits e-sevai maiyam with registration number
4. E-sevai staff verifies using biometric data
5. Renewal is processed and stay validity extended
6. All activities are logged for audit purposes

## Security Features

- Separate authentication system for e-sevai staff
- Unique registration numbers for worker identification
- Biometric verification requirement
- Audit trail of all verification activities
- Secure data handling and storage