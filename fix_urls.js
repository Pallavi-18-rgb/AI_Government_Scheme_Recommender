const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk('./frontend/src', function(err, results) {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('import.meta.env.VITE_API_BASE_URL')) {
      // The bad string is: `${import.meta.env.VITE_API_BASE_URL || \'http://localhost:5000/api\'}/schemes'
      // It should be: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/schemes`
      
      // Let's replace the escaped single quotes inside the curly brace with normal single quotes
      let newContent = content.replace(/\\'/g, "'");
      
      // Let's replace the starting `${ with `\${
      // Actually it's just literally: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}
      // The issue is it's not enclosed in backticks properly.
      // Wait, earlier I replaced: `'http://localhost:5000/api` with `` `${import.meta.env.VITE_API_BASE_URL || \'http://localhost:5000/api\'} ``
      // Notice the start had NO backtick. Let's fix that.
      
      // So let's replace `${import.meta.env.VITE_API_BASE_URL with `${import.meta.env.VITE_API_BASE_URL
      newContent = newContent.replace(/\$\{import\.meta\.env\.VITE_API_BASE_URL/g, '`${import.meta.env.VITE_API_BASE_URL');
      
      // Also the end of the string has a ' instead of `
      // I can just replace `}'` or `}/something'` with `}/something\``
      // Simple regex: replace `'` at the end of the line or before `)`, `,`, etc.
      // Easiest is to replace: /'(\)|\s|,|;)/g with `\`$1` but that might hit other strings.
      // Let's just fix the ending quotes of these specific template strings.
      // If we find `${...}/schemes'` -> `${...}/schemes`
      newContent = newContent.replace(/(\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http:\/\/localhost:5000\/api'\}[^']*)'/g, '$1`');
      
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Updated', file);
    }
  });
});
