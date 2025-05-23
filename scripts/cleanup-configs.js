// scripts/cleanup-configs.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// List of duplicate config files to remove
const filesToRemove = [
  '.eslintrc.js',
  '.prettierrc.json',
  '.lintstagedrc.json',
];

// Function to safely remove a file if it exists
function safeRemoveFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️ Skipped (not found): ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error removing ${filePath}:`, error.message);
    return false;
  }
}

// Main function to clean up duplicate config files
function cleanupConfigs() {
  console.log('🧹 Cleaning up duplicate config files...');
  
  let removedCount = 0;
  
  // Remove files from the root directory
  for (const file of filesToRemove) {
    const filePath = path.join(rootDir, file);
    if (safeRemoveFile(filePath)) {
      removedCount++;
    }
  }
  
  // Also check in apps and packages directories
  const dirsToCheck = ['apps', 'packages'];
  
  for (const dir of dirsToCheck) {
    const dirPath = path.join(rootDir, dir);
    
    if (!fs.existsSync(dirPath)) {
      continue;
    }
    
    const subdirs = fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const subdir of subdirs) {
      for (const file of filesToRemove) {
        const filePath = path.join(dirPath, subdir, file);
        if (safeRemoveFile(filePath)) {
          removedCount++;
        }
      }
    }
  }
  
  console.log(`\n🎉 Cleanup complete! Removed ${removedCount} duplicate config files.`);
  
  if (removedCount === 0) {
    console.log('ℹ️ No duplicate config files were found.');
  }
}

// Run the cleanup
cleanupConfigs();