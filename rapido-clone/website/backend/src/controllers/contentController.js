const fs = require('fs/promises');
const path = require('path');

const contentPath = path.join(__dirname, '../data/siteContent.json');

const readContent = async () => JSON.parse(await fs.readFile(contentPath, 'utf8'));

exports.getContent = async (req, res, next) => {
  try {
    res.json({ success: true, data: await readContent() });
  } catch (error) {
    next(error);
  }
};

exports.updateContent = async (req, res, next) => {
  try {
    const currentContent = await readContent();
    const nextContent = {
      ...currentContent,
      ...req.body,
      brand: { ...currentContent.brand, ...(req.body.brand || {}) },
      home: { ...currentContent.home, ...(req.body.home || {}) },
      navigation: req.body.navigation || currentContent.navigation,
      vehicles: req.body.vehicles || currentContent.vehicles
    };

    await fs.writeFile(contentPath, `${JSON.stringify(nextContent, null, 2)}\n`, 'utf8');
    res.json({ success: true, data: nextContent });
  } catch (error) {
    next(error);
  }
};
