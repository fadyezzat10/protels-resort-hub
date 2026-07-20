#!/bin/bash
# Fix: PUBLIC_OBJECT_SEARCH_PATHS not set error in CMS uploads
# Run this on the VPS: bash fix-object-storage.sh

set -e
cd /var/www/protels

echo "Applying Object Storage fix..."

# Patch objectStorage.ts to return [] instead of throwing
node -e "
const fs = require('fs');
const file = 'server/replit_integrations/object_storage/objectStorage.ts';
let code = fs.readFileSync(file, 'utf8');

// Remove the throw block (lines: if paths.length === 0 { throw ... })
const oldBlock = \`    if (paths.length === 0) {
      throw new Error(
        \"PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' \" +
          \"tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths).\"
      );
    }
    return paths;\`;

const newBlock = \`    return paths;\`;

if (code.includes(oldBlock)) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync(file, code);
  console.log('✓ Fixed objectStorage.ts');
} else {
  console.log('⚠ objectStorage.ts already patched or differs — skipping');
}
"

# Patch routes.ts — company-profile/upload to use local fallback
node -e "
const fs = require('fs');
const file = 'server/routes.ts';
let code = fs.readFileSync(file, 'utf8');

const oldPDF = \`      const objService = new ObjectStorageService();
      const searchPaths = objService.getPublicObjectSearchPaths();
      const publicPath = searchPaths[0];
      const sanitizedName = req.file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, \"_\")
        .replace(/_+/g, \"_\");
      const fileName = \\\`company-profile-\\\${Date.now()}-\\\${sanitizedName}\\\`;
      const fullObjectPath = \\\`\\\${publicPath}/\\\${fileName}\\\`;

      const parts = fullObjectPath.split(\"/\").filter(Boolean);
      const bucketName = parts[0];
      const objectName = parts.slice(1).join(\"/\");

      const { objectStorageClient } = await import(\"./replit_integrations/object_storage/objectStorage\");
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      await file.save(req.file.buffer, {
        metadata: { contentType: \"application/pdf\" },
      });

      const serveUrl = \\\`/public/uploads/\\\${encodeURIComponent(fileName)}\\\`;
      await storage.upsertSetting(\"company_profile_pdf\", serveUrl);
      res.json({ url: serveUrl });\`;

if (code.includes(oldPDF)) {
  const newPDF = \`      const sanitizedName2 = req.file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, \"_\")
        .replace(/_+/g, \"_\");
      const fileName2 = \\\`company-profile-\\\${Date.now()}-\\\${sanitizedName2}\\\`;
      let serveUrl2 = \\\`/uploads/\\\${fileName2}\\\`;
      try {
        const objService = new ObjectStorageService();
        const searchPaths = objService.getPublicObjectSearchPaths();
        if (searchPaths.length > 0) {
          const publicPath = searchPaths[0];
          const fullObjectPath = \\\`\\\${publicPath}/\\\${fileName2}\\\`;
          const parts = fullObjectPath.split(\"/\").filter(Boolean);
          const bucketName = parts[0];
          const objectName = parts.slice(1).join(\"/\");
          const { objectStorageClient } = await import(\"./replit_integrations/object_storage/objectStorage\");
          const bucket = objectStorageClient.bucket(bucketName);
          const objFile = bucket.file(objectName);
          await objFile.save(req.file.buffer, { metadata: { contentType: \"application/pdf\" } });
          serveUrl2 = \\\`/public/uploads/\\\${encodeURIComponent(fileName2)}\\\`;
        } else {
          require('fs').writeFileSync(require('path').join(process.cwd(), 'uploads', fileName2), req.file.buffer);
        }
      } catch (e) {
        require('fs').writeFileSync(require('path').join(process.cwd(), 'uploads', fileName2), req.file.buffer);
      }
      await storage.upsertSetting(\"company_profile_pdf\", serveUrl2);
      res.json({ url: serveUrl2 });\`;
  code = code.replace(oldPDF, newPDF);
  fs.writeFileSync(file, code);
  console.log('✓ Fixed routes.ts PDF upload');
} else {
  console.log('⚠ routes.ts PDF section already patched or differs — skipping');
}
"

echo "Restarting app..."
pm2 restart protels 2>/dev/null || pm2 restart all

echo "Done! The PUBLIC_OBJECT_SEARCH_PATHS error should be fixed."
