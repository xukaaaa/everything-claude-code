#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const {
  getClaudeDir,
  getSourceItems,
  getSubItems,
  checkExists,
  copyItem,
  getSummary
} = require('./utils');

// Skills that require API keys
const SKILLS_REQUIRING_API_KEYS = {
  'web-search': {
    envVar: 'TAVILY_API_KEY',
    name: 'Tavily API',
    getUrl: 'https://app.tavily.com',
    description: 'Required for web search functionality'
  }
  // Add more skills here as needed
  // 'another-skill': { envVar: 'ANOTHER_API_KEY', ... }
};

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⚠ Installation cancelled by user.'));
  process.exit(0);
});

async function main() {
  // Skip installation in CI/CD or if explicitly disabled
  if (process.env.CI || process.env.SKIP_CLAUDE_SETUP) {
    console.log(chalk.gray('\n⊘ Skipping Claude setup (CI environment or SKIP_CLAUDE_SETUP set)'));
    console.log(chalk.gray('  Run "npx claude-setup" manually when ready.\n'));
    process.exit(0);
  }

  // Skip if not in TTY (non-interactive terminal)
  if (!process.stdin.isTTY) {
    console.log(chalk.gray('\n⊘ Skipping Claude setup (non-interactive terminal)'));
    console.log(chalk.gray('  Run "npx claude-setup" manually for interactive setup.\n'));
    process.exit(0);
  }

  console.log(chalk.bold.cyan('\n🚀 Claude Everything Setup\n'));
  console.log(chalk.gray('This will copy configuration files to ~/.claude/\n'));

  const claudeDir = getClaudeDir();
  
  // Ensure .claude directory exists
  await fs.ensureDir(claudeDir);
  console.log(chalk.green(`✓ Claude directory: ${claudeDir}\n`));

  // Get all source items
  const sourceItems = getSourceItems();
  
  if (sourceItems.length === 0) {
    console.log(chalk.yellow('⚠ No items found to copy.'));
    process.exit(0);
  }

  let restart = true;
  
  while (restart) {
    restart = false;
    
    // Step 1: Select main folders
    console.log(chalk.bold('📁 Select folders to install:\n'));
    
    const folderChoices = sourceItems.map(item => ({
      name: `${item.name}/`,
      value: item.name,
      checked: true // Default: all selected
    }));

    const { selectedFolders } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selectedFolders',
      message: 'Choose folders to copy (Space to select, Enter to confirm)',
      choices: folderChoices,
      pageSize: 10
    }]);

    if (!selectedFolders || selectedFolders.length === 0) {
      console.log(chalk.yellow('\n⚠ No folders selected. Installation cancelled.'));
      process.exit(0);
    }

    // Step 2: For each selected folder, check if it has sub-items and let user select
    const itemsToCopy = [];
    
    // Folder icons mapping
    const folderIcons = {
      'agents': '🤖',
      'skills': '📚',
      'commands': '⚡',
      'rules': '📏',
      'hooks': '🪝',
      'contexts': '📝',
      'examples': '💡',
      'plugins': '🔌'
    };
    
    for (const folderName of selectedFolders) {
      const folderPath = path.join(path.dirname(__dirname), folderName);
      const subItems = getSubItems(folderPath);
      
      if (subItems.length > 0) {
        // Let user choose which sub-items to copy
        const icon = folderIcons[folderName] || '📁';
        console.log(chalk.bold(`\n${icon} Select items from ${chalk.cyan(folderName)}:\n`));
        
        const subChoices = subItems.map(item => ({
          name: `${item.name} ${item.type === 'directory' ? '📁' : '📄'}`,
          value: item.name,
          checked: true
        }));

        const { selectedSubItems } = await inquirer.prompt([{
          type: 'checkbox',
          name: 'selectedSubItems',
          message: `Choose items from ${folderName} (Space to select, Enter to confirm)`,
          choices: subChoices,
          pageSize: 15
        }]);

        if (selectedSubItems && selectedSubItems.length > 0) {
          selectedSubItems.forEach(subItemName => {
            const subItem = subItems.find(item => item.name === subItemName);
            itemsToCopy.push({
              source: subItem.path,
              dest: path.join(claudeDir, folderName, subItemName),
              name: `${folderName}/${subItemName}`,
              type: subItem.type
            });
          });
        }
      } else {
        // Empty folder or no sub-items, copy entire folder
        itemsToCopy.push({
          source: folderPath,
          dest: path.join(claudeDir, folderName),
          name: folderName,
          type: 'directory'
        });
      }
    }

    if (itemsToCopy.length === 0) {
      console.log(chalk.yellow('\n⚠ No items selected. Installation cancelled.'));
      process.exit(0);
    }

    // Step 3: Show summary and ask to continue or restart
    console.log(chalk.bold('\n📋 Selection Summary:\n'));
    console.log(chalk.gray(`  Total items selected: ${itemsToCopy.length}`));
    console.log(chalk.gray('\n  Selected items:'));
    itemsToCopy.forEach(item => {
      console.log(chalk.gray(`    - ${item.name}`));
    });
    console.log();

    const { continueOrRestart } = await inquirer.prompt([{
      type: 'list',
      name: 'continueOrRestart',
      message: 'What would you like to do?',
      choices: [
        { name: 'Continue with installation', value: 'continue' },
        { name: 'Start over (reselect items)', value: 'restart' },
        { name: 'Cancel installation', value: 'cancel' }
      ],
      default: 0
    }]);

    if (continueOrRestart === 'restart') {
      console.log(chalk.cyan('\n↻ Restarting selection...\n'));
      restart = true;
      continue;
    }

    if (continueOrRestart === 'cancel' || !continueOrRestart) {
      console.log(chalk.yellow('\n⚠ Installation cancelled.'));
      process.exit(0);
    }

    // Step 4: Check for existing files and ask about overwrite
    const existingItems = itemsToCopy.filter(item => 
      fs.existsSync(item.dest)
    );

    if (existingItems.length > 0) {
      console.log(chalk.yellow(`\n⚠ Found ${existingItems.length} existing item(s):\n`));
      existingItems.forEach(item => {
        console.log(chalk.gray(`  - ${item.name}`));
      });

      const { overwriteAction } = await inquirer.prompt([{
        type: 'list',
        name: 'overwriteAction',
        message: 'How do you want to handle existing files?',
        choices: [
          { name: 'Ask for each item', value: 'ask' },
          { name: 'Skip all existing items', value: 'skip' },
          { name: 'Overwrite all', value: 'overwrite' },
          { name: 'Backup and overwrite all', value: 'backup' }
        ],
        default: 0
      }]);

      if (!overwriteAction) {
        console.log(chalk.yellow('\n⚠ Installation cancelled.'));
        process.exit(0);
      }

      // Handle overwrite logic
      for (const item of itemsToCopy) {
        const exists = fs.existsSync(item.dest);
        
        if (exists) {
          if (overwriteAction === 'skip') {
            item.skip = true;
          } else if (overwriteAction === 'backup') {
            item.backup = true;
          } else if (overwriteAction === 'ask') {
            const { shouldOverwrite } = await inquirer.prompt([{
              type: 'confirm',
              name: 'shouldOverwrite',
              message: `Overwrite ${chalk.cyan(item.name)}?`,
              default: false
            }]);
            
            if (!shouldOverwrite) {
              item.skip = true;
            } else {
              const { shouldBackup } = await inquirer.prompt([{
                type: 'confirm',
                name: 'shouldBackup',
                message: `  Create backup of ${chalk.cyan(item.name)}?`,
                default: true
              }]);
              item.backup = shouldBackup;
            }
          }
        }
      }
    }

    // Step 5: Final confirmation
    const itemsToActuallyCopy = itemsToCopy.filter(item => !item.skip);
    
    if (itemsToActuallyCopy.length === 0) {
      console.log(chalk.yellow('\n⚠ No items to copy. Installation cancelled.'));
      process.exit(0);
    }

    console.log(chalk.bold('\n📋 Final Installation Summary:\n'));
    console.log(chalk.gray(`  Destination: ${claudeDir}`));
    console.log(chalk.gray(`  Items to copy: ${itemsToActuallyCopy.length}`));
    
    if (itemsToCopy.some(item => item.skip)) {
      console.log(chalk.gray(`  Items to skip: ${itemsToCopy.filter(item => item.skip).length}`));
    }
    
    console.log();

    const { confirmInstall } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmInstall',
      message: 'Proceed with installation?',
      default: true
    }]);

    if (!confirmInstall) {
      console.log(chalk.yellow('\n⚠ Installation cancelled.'));
      process.exit(0);
    }

    // Step 6: Check for skills requiring API keys
    const selectedSkills = itemsToActuallyCopy
      .filter(item => item.name.startsWith('skills/'))
      .map(item => item.name.replace('skills/', ''));
    
    const skillsNeedingKeys = selectedSkills.filter(skillName => 
      SKILLS_REQUIRING_API_KEYS[skillName]
    );

    if (skillsNeedingKeys.length > 0) {
      console.log(chalk.bold('\n🔑 API Key Configuration\n'));
      
      for (const skillName of skillsNeedingKeys) {
        const config = SKILLS_REQUIRING_API_KEYS[skillName];
        const existingKey = process.env[config.envVar];
        
        if (existingKey) {
          console.log(chalk.green(`  ✓ ${config.name} key already set (${config.envVar})`));
        } else {
          console.log(chalk.yellow(`  ⚠ ${skillName} requires ${config.name}`));
          console.log(chalk.gray(`    ${config.description}`));
          console.log(chalk.gray(`    Get your API key at: ${config.getUrl}\n`));
          
          const { wantToSetKey } = await inquirer.prompt([{
            type: 'confirm',
            name: 'wantToSetKey',
            message: `Would you like to set up ${config.envVar} now?`,
            default: true
          }]);

          if (wantToSetKey) {
            const { apiKey } = await inquirer.prompt([{
              type: 'password',
              name: 'apiKey',
              message: `Enter your ${config.name} key:`,
              mask: '*',
              validate: (input) => {
                if (!input || input.trim().length === 0) {
                  return 'API key cannot be empty';
                }
                return true;
              }
            }]);

            if (apiKey && apiKey.trim()) {
              // Detect shell and config file
              const shell = process.env.SHELL || '/bin/bash';
              let rcFile;
              
              if (shell.includes('zsh')) {
                rcFile = path.join(os.homedir(), '.zshrc');
              } else if (shell.includes('bash')) {
                // Check for .bash_profile first (macOS), then .bashrc
                const bashProfile = path.join(os.homedir(), '.bash_profile');
                const bashrc = path.join(os.homedir(), '.bashrc');
                rcFile = fs.existsSync(bashProfile) ? bashProfile : bashrc;
              } else {
                rcFile = path.join(os.homedir(), '.profile');
              }

              try {
                const exportLine = `\nexport ${config.envVar}="${apiKey.trim()}"\n`;
                
                // Check if already exists in file
                let fileContent = '';
                if (fs.existsSync(rcFile)) {
                  fileContent = fs.readFileSync(rcFile, 'utf8');
                }
                
                if (fileContent.includes(`export ${config.envVar}=`)) {
                  // Update existing
                  const regex = new RegExp(`export ${config.envVar}=.*`, 'g');
                  fileContent = fileContent.replace(regex, `export ${config.envVar}="${apiKey.trim()}"`);
                  fs.writeFileSync(rcFile, fileContent);
                  console.log(chalk.green(`  ✓ Updated ${config.envVar} in ${rcFile}`));
                } else {
                  // Append new
                  fs.appendFileSync(rcFile, exportLine);
                  console.log(chalk.green(`  ✓ Added ${config.envVar} to ${rcFile}`));
                }
                
                console.log(chalk.gray(`    Run 'source ${rcFile}' or restart your terminal to apply.\n`));
              } catch (error) {
                console.log(chalk.red(`  ✗ Failed to save API key: ${error.message}`));
                console.log(chalk.gray(`    You can manually add this to your shell config:`));
                console.log(chalk.cyan(`    export ${config.envVar}="your-api-key"\n`));
              }
            }
          } else {
            console.log(chalk.gray(`    You can set it later by adding to your shell config:`));
            console.log(chalk.cyan(`    export ${config.envVar}="your-api-key"\n`));
          }
        }
      }
    }

    // Step 7: Copy files
    console.log(chalk.bold('\n📦 Installing...\n'));

    let successCount = 0;
    let errorCount = 0;

    for (const item of itemsToActuallyCopy) {
      try {
        process.stdout.write(chalk.gray(`  Copying ${item.name}... `));
        
        const result = await copyItem(item.source, item.dest, {
          backup: item.backup,
          overwrite: true
        });

        if (result.success) {
          console.log(chalk.green('✓'));
          successCount++;
        } else {
          console.log(chalk.red(`✗ ${result.error}`));
          errorCount++;
        }
      } catch (error) {
        console.log(chalk.red(`✗ ${error.message}`));
        errorCount++;
      }
    }

    // Step 8: Show results
    console.log(chalk.bold('\n✨ Installation Complete!\n'));
    console.log(chalk.green(`  ✓ Successfully copied: ${successCount} item(s)`));
    
    if (errorCount > 0) {
      console.log(chalk.red(`  ✗ Failed: ${errorCount} item(s)`));
    }
    
    if (itemsToCopy.some(item => item.skip)) {
      console.log(chalk.yellow(`  ⊘ Skipped: ${itemsToCopy.filter(item => item.skip).length} item(s)`));
    }

    console.log(chalk.gray(`\n  Configuration installed to: ${claudeDir}`));
    console.log(chalk.gray(`  You can run 'npx claude-setup' anytime to reconfigure.\n`));
  }
}

// Run the script
main().catch(error => {
  console.error(chalk.red('\n✗ Installation failed:'), error.message);
  process.exit(1);
});
