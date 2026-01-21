#!/usr/bin/env node

/**
 * Quick test to verify the installation works
 */

const path = require('path');
const fs = require('fs-extra');
const {
  getClaudeDir,
  getSourceItems,
  getSubItems
} = require('./utils');

async function test() {
  console.log('🧪 Testing installation script...\n');

  try {
    // Test 1: Get Claude directory
    const claudeDir = getClaudeDir();
    console.log(`✓ Claude directory: ${claudeDir}`);

    // Test 2: Get source items
    const sourceItems = getSourceItems();
    console.log(`✓ Found ${sourceItems.length} source folders:`);
    sourceItems.forEach(item => {
      console.log(`  - ${item.name}`);
    });

    // Test 3: Get sub-items for each folder
    console.log('\n✓ Sub-items in each folder:');
    for (const item of sourceItems) {
      const subItems = getSubItems(item.path);
      console.log(`  ${item.name}: ${subItems.length} items`);
    }

    // Test 4: Check inquirer is installed
    try {
      require('inquirer');
      console.log('\n✓ inquirer is installed');
    } catch (e) {
      console.log('\n✗ inquirer is NOT installed');
      throw e;
    }

    // Test 5: Check chalk is installed
    try {
      require('chalk');
      console.log('✓ chalk is installed');
    } catch (e) {
      console.log('✗ chalk is NOT installed');
      throw e;
    }

    // Test 6: Check fs-extra is installed
    try {
      require('fs-extra');
      console.log('✓ fs-extra is installed');
    } catch (e) {
      console.log('✗ fs-extra is NOT installed');
      throw e;
    }

    console.log('\n✨ All tests passed!\n');
    console.log('To test the interactive installer, open your terminal and run:');
    console.log('  node scripts/postinstall.js\n');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  }
}

test();
