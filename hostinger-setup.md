# Hostinger Environment Variables Setup

## Required Environment Variables for Hostinger

You need to set these environment variables in your Hostinger hosting panel:

### Firebase Admin SDK Configuration
```
FIREBASE_PROJECT_ID=company-profile-grow-synergy
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@company-profile-grow-synergy.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQChvzANtK317wFA
QAT8w1linwKx+T2b2Syug/G/8Zaw/osfAHJhanGuaqA/9NZMdCsQ19bOsyq0/Moq
hHe7Ma4um/JptIBFtWOfkTvEtYDzYRxKPhiOMWVRDTNbkmSD7wWlB4o+kOnNYifD
CTFN1Zn/dOZA7rgG+VZlLTVbJ4pjfVv0FMYNt575akY6Be4LqTvGOsMW8gGrNedb
P5YVqpYW1YPO6sLuxweaTseR3kwJ1wPdqq3h70rcU+wHvHYrtZrdQMtfDlhGpMnS
haCBH9sQG5H3/egN2DdvFqzJ50/2NFBBIOFmsBUxxD3Z8VNGCZrFYvMrOi0/gLt9
DCIZtABpAgMBAAECggEAIeUEJ2Mc70QKAZJI2UUAhrOmp3AA8pdEjz+UGfKA7w8w
TStVTMe3EeNDOJPQko3ndmyclY0jHnE41kcTJhWnmBnS50bNeI4l1crj+PlGD/pi
KMaxc56zShRXllFroeAlUStu02SfsgvnJC5ZeCOSVV+EXsgHpWJ7sdES9Mqo6+cD
4W87/eUqR4vM+aBOBvtzsxyZCbJ8/wC4aTIQA4/uyElwqeUZy0yYH6BylUchRjXX
V/PB37kiK2BDxJXxazr+YdBXfXCan2GsqCZF+SD7qYrkQgEmzjQ7oPou37fW6BS3
BnyhVk+B8DjJOiCyk+GWyjsqxPJmEYrdrf2JKGRQuQKBgQDjDmvlmnKgvs0e5CXc
Zn0n3o1TeG+WAl1Ydv45ZtouuZwdXw+NesMgv9ddc3Z+gqmo0MVXwsKptqxcMSfs
J+tB9idC1CPKhs9r3wbpD3rO8iDHsk9pCqykFJyCN5be69m2J9ECc/GFmqoWKUQC
### Server Configuration
```
NODE_ENV=production
SITE_URL=https://growsynergyid.com
SITE_NAME=Pelatihan Data Analitik Terbaik Indonesia
SESSION_SECRET=grow-synergy-admin-secret-key
ADMIN_EMAIL=admin@grow-synergy.com
ADMIN_USERNAME=admin@grow-synergy.com
ADMIN_PASSWORD=Mieayam1
```

## Steps to Set Up on Hostinger

1. **Login to Hostinger Control Panel**
2. **Go to Hosting → Advanced → Environment Variables**
3. **Add each variable above**:
   - Variable Name: `NODE_ENV`
   - Variable Value: `production`
4. **Repeat for all variables listed above**
5. **Save the changes**
6. **Restart your application** in Hostinger panel

## Important Notes

- Make sure all variables are exactly as shown (case-sensitive)
- After setting variables, restart your Node.js application
- The `.env` file is ignored in production hosting

## Verification

After setup, visit: `https://growsynergyid.com/admin/debug-env`

You should see all variables marked as "✅ Set" instead of "❌ Missing".
