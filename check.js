require('C:/GharKaMali/GharKaMali_Backend/node_modules/dotenv').config({ path: 'C:/GharKaMali/GharKaMali_Backend/.env' });
try {
  require('C:/GharKaMali/GharKaMali_Backend/src/routes/index.js');
  console.log('SUCCESS');
} catch (e) {
  console.log('ERROR:', e.message);
  console.log(e.stack);
}
