// Upload Names Script
// This script uploads names from the female_unisex_names.json file to Firebase Firestore masterNames collection

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Path to your service account credentials file
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

// Check if service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('ERROR: Service account key file not found at:', serviceAccountPath);
  console.log('Please download your service account key file from Firebase Console:');
  console.log('1. Go to Firebase Console -> Project Settings -> Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the file as "serviceAccountKey.json" in your project root directory');
  process.exit(1);
}

// Initialize Firebase Admin SDK with service account
try {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

// Get Firestore database instance
const db = admin.firestore();

// Path to the names JSON file
const namesFilePath = path.join(__dirname, '../data/female_unisex_names.json');

async function uploadNames() {
  try {
    console.log('Loading names from:', namesFilePath);
    
    // Read and parse the JSON file
    const rawData = fs.readFileSync(namesFilePath, 'utf8');
    const namesByLetter = JSON.parse(rawData);
    
    // Check if the JSON has the expected structure
    if (!namesByLetter || typeof namesByLetter !== 'object') {
      throw new Error('The JSON file does not contain a valid object');
    }

    console.log('Preparing names for upload...');
    
    let namesToUpload = [];
    let nameCount = 0;
    let letterCount = 0;

    // Process each letter section
    for (const letter in namesByLetter) {
      letterCount++;
      if (Array.isArray(namesByLetter[letter])) {
        namesByLetter[letter].forEach((nameEntry, index) => {
          // Check if the entry has the required fields
          if (nameEntry.Gender) {
            // For entries with Name property
            const name = nameEntry.Name || `${letter}name${index}`;
            
            namesToUpload.push({
              id: uuidv4(),
              name: name,
              gender: nameEntry.Gender.toLowerCase(),
            });
            nameCount++;
          }
        });
      }
    }

    if (namesToUpload.length === 0) {
      throw new Error('No valid names found for upload. Please check your JSON data format.');
    }

    console.log(`Found ${nameCount} names across ${letterCount} letters to upload`);
    
    // Upload names in batches to avoid Firestore limits
    const batchSize = 500; // Firestore batch limit is 500 operations
    let successCount = 0;

    console.log('Starting upload to Firestore...');
    
    // Process in batches
    for (let i = 0; i < namesToUpload.length; i += batchSize) {
      const batch = db.batch();
      const currentBatch = namesToUpload.slice(i, i + batchSize);
      
      currentBatch.forEach(nameEntry => {
        const nameRef = db.collection('masterNames').doc(nameEntry.id);
        batch.set(nameRef, nameEntry);
      });
      
      try {
        await batch.commit();
        successCount += currentBatch.length;
        console.log(`Progress: ${successCount}/${nameCount} names uploaded`);
      } catch (error) {
        console.error(`Failed to upload batch starting at index ${i}:`, error);
      }
    }

    console.log('Upload completed.');
    console.log(`Successfully uploaded ${successCount} out of ${nameCount} names.`);
    
    if (successCount < nameCount) {
      console.warn(`Warning: ${nameCount - successCount} names failed to upload`);
    }
    
  } catch (error) {
    console.error('Error during name upload process:', error);
  }
}

// Run the upload function
uploadNames().then(() => {
  console.log('Script execution completed');
}).catch(error => {
  console.error('Upload script error:', error);
});