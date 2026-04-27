import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packageJsonPath = path.join(root, 'package.json');
const gradlePath = path.join(root, 'android/app/build.gradle');

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const gradle = readFileSync(gradlePath, 'utf8');

const currentVersion = packageJson.version === '0.0.0' ? '1.0.0' : packageJson.version;
const parts = currentVersion.split('.').map((part) => Number.parseInt(part, 10) || 0);
const nextVersion = `${parts[0]}.${parts[1]}.${parts[2] + 1}`;

packageJson.version = nextVersion;
writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

const versionCodeMatch = gradle.match(/versionCode\s+(\d+)/);
const currentCode = versionCodeMatch ? Number.parseInt(versionCodeMatch[1], 10) : 0;

const nextGradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${currentCode + 1}`)
  .replace(/versionName\s+"[^"]+"/, `versionName "${nextVersion}"`);

writeFileSync(gradlePath, nextGradle);

process.stdout.write(`${nextVersion}\n`);
