const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = {
  favicon: 32,
  logo192: 192,
  logo512: 512
};

async function generateIcons() {
  const svgPath = path.resolve(__dirname, '../src/assets/logo.svg');
  
  for (const [name, size] of Object.entries(sizes)) {
    const outputPath = path.resolve(
      __dirname, 
      `../public/${name === 'favicon' ? 'favicon.png' : name + '.png'}`
    );
    
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
      
    // Convert favicon.png to favicon.ico using sharp
    if (name === 'favicon') {
      const faviconPath = path.resolve(__dirname, '../public/favicon.ico');
      await fs.copyFile(outputPath, faviconPath);
      await fs.unlink(outputPath); // Remove the temporary PNG
    }
    
    console.log(`Generated ${outputPath}`);
  }
}

generateIcons().catch(error => {
  console.error('Error generating icons:', error);
  process.exit(1);
});
