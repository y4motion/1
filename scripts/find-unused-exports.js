const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findUnusedComponents() {
  const srcDir = path.join(__dirname, '../frontend/src');
  const components = [];
  
  // Recursively find all .jsx/.js files
  function walkDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        try {
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            walkDir(filePath);
          } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            components.push({
              path: filePath,
              name: path.basename(file, path.extname(file)),
              relativePath: path.relative(srcDir, filePath)
            });
          }
        } catch (e) {
          // Skip files we can't access
        }
      });
    } catch (e) {
      console.error(`Error reading directory ${dir}:`, e.message);
    }
  }
  
  walkDir(srcDir);
  
  console.log('🔍 Searching for unused components...\n');
  console.log(`📊 Total files found: ${components.length}\n`);
  
  const unused = [];
  const skipFiles = ['index', 'App', 'reportWebVitals', 'setupTests', 'utils'];
  
  components.forEach(component => {
    const { name, path: filePath, relativePath } = component;
    
    // Skip special files
    if (skipFiles.includes(name)) {
      return;
    }
    
    // Search for component usage
    try {
      const result = execSync(
        `grep -r "import.*${name}" ${srcDir} --include="*.js" --include="*.jsx" | grep -v "${filePath}" | wc -l`,
        { encoding: 'utf8' }
      );
      
      const usageCount = parseInt(result.trim());
      
      if (usageCount === 0) {
        unused.push({ name, relativePath });
      }
    } catch (error) {
      // If grep finds nothing, component is unused
      unused.push({ name, relativePath });
    }
  });
  
  if (unused.length === 0) {
    console.log('✅ No unused components found! Code is clean.\n');
  } else {
    console.log(`❌ Found ${unused.length} potentially unused components:\n`);
    unused.forEach(({ name, relativePath }) => {
      console.log(`   - ${name}`);
      console.log(`     ${relativePath}\n`);
    });
  }
  
  // Summary
  console.log('📊 SUMMARY:');
  console.log(`   Total components: ${components.length}`);
  console.log(`   Potentially unused: ${unused.length}`);
  console.log(`   Usage rate: ${((components.length - unused.length) / components.length * 100).toFixed(1)}%\n`);
  
  return unused;
}

findUnusedComponents();
