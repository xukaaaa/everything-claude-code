const fs = require('fs-extra');
const path = require('path');
const os = require('os');

/**
 * Get the Claude config directory path
 */
function getClaudeDir() {
  return path.join(os.homedir(), '.claude');
}

/**
 * Get all folders and files to copy (excluding root files and mcp-configs)
 */
function getSourceItems() {
  const sourceDir = path.join(__dirname, '..');
  const items = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  return items
    .filter(item => {
      // Only include directories
      if (!item.isDirectory()) return false;
      
      // Exclude these directories
      const excludeDirs = [
        'node_modules',
        '.git',
        'scripts',
        'bin',
        'mcp-configs',
        '.idea',
        '.vscode'
      ];
      
      return !excludeDirs.includes(item.name);
    })
    .map(item => ({
      name: item.name,
      path: path.join(sourceDir, item.name),
      type: 'directory'
    }));
}

/**
 * Get sub-items within a directory (for checkbox selection)
 */
function getSubItems(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  return items
    .filter(item => !item.name.startsWith('.'))
    .map(item => ({
      name: item.name,
      path: path.join(dirPath, item.name),
      type: item.isDirectory() ? 'directory' : 'file'
    }));
}

/**
 * Check if a path exists in the destination
 */
function checkExists(itemName, destDir) {
  const destPath = path.join(destDir, itemName);
  return fs.existsSync(destPath);
}

/**
 * Copy a directory or file to destination
 */
async function copyItem(sourcePath, destPath, options = {}) {
  const { backup = false, overwrite = true } = options;
  
  try {
    // Create backup if requested and destination exists
    if (backup && fs.existsSync(destPath)) {
      const backupPath = `${destPath}.backup`;
      await fs.copy(destPath, backupPath, { overwrite: true });
      console.log(`  ✓ Backed up to ${path.basename(backupPath)}`);
    }
    
    // Copy the item
    await fs.copy(sourcePath, destPath, { overwrite });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get a summary of what will be copied
 */
function getSummary(selectedItems) {
  let totalFiles = 0;
  let totalDirs = 0;
  
  selectedItems.forEach(item => {
    if (fs.statSync(item.path).isDirectory()) {
      totalDirs++;
      // Count files recursively
      const countFiles = (dir) => {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        items.forEach(subItem => {
          const fullPath = path.join(dir, subItem.name);
          if (subItem.isDirectory()) {
            totalDirs++;
            countFiles(fullPath);
          } else {
            totalFiles++;
          }
        });
      };
      countFiles(item.path);
    } else {
      totalFiles++;
    }
  });
  
  return { totalFiles, totalDirs };
}

module.exports = {
  getClaudeDir,
  getSourceItems,
  getSubItems,
  checkExists,
  copyItem,
  getSummary
};
