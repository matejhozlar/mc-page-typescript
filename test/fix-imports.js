import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, "dist");

/**
 * Check if a path points to a directory with an index.js file
 */
function hasIndexFile(basePath, importPath) {
  const fullPath = path.join(basePath, importPath);
  const indexPath = path.join(fullPath, "index.js");
  return fs.existsSync(indexPath);
}

/**
 * Check if a file exists with .js extension
 */
function fileExists(basePath, importPath) {
  const fullPath = path.join(basePath, importPath + ".js");
  return fs.existsSync(fullPath);
}

function fixImports(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(filePath, "utf-8");
      const fileDir = path.dirname(filePath);

      content = content.replace(
        /from ['"](\.[^'"]+)['"];?/gm,
        (match, importPath) => {
          if (importPath.endsWith(".js")) {
            return match;
          }

          const resolvedBase = path.resolve(fileDir, importPath);
          const relativeToBase = path.relative(distDir, resolvedBase);

          if (hasIndexFile(distDir, relativeToBase)) {
            return `from '${importPath}/index.js';`;
          }

          if (fileExists(distDir, relativeToBase)) {
            return `from '${importPath}.js';`;
          }

          console.warn(
            `Could not resolve: ${importPath} in ${path.relative(
              distDir,
              filePath
            )}`
          );
          return `from '${importPath}.js';`;
        }
      );

      fs.writeFileSync(filePath, content, "utf-8");
    }
  }
}

console.log("Fixing import paths...");
fixImports(distDir);
console.log("Import paths fixed!");
