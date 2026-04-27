import { App } from '@capacitor/app';
import { Capacitor, registerPlugin } from '@capacitor/core';

type ReleaseAsset = {
  name: string;
  browser_download_url: string;
};

type GitHubRelease = {
  tag_name: string;
  name: string;
  body: string;
  assets: ReleaseAsset[];
};

type AppUpdateInfo = {
  currentVersion: string;
  latestVersion: string;
  assetName: string;
  assetUrl: string;
  releaseNotes: string;
  hasUpdate: boolean;
};

type AndroidUpdaterPlugin = {
  installApk(options: { apkUrl: string; fileName: string }): Promise<void>;
};

const AndroidUpdater = registerPlugin<AndroidUpdaterPlugin>('AndroidUpdater');

const RELEASE_API_URL = 'https://api.github.com/repos/boomoodxf/wahaha-socks/releases/latest';

const normalizeVersion = (version: string) => version.replace(/^v/i, '').trim();

const compareVersions = (a: string, b: string) => {
  const left = normalizeVersion(a).split('.').map((part) => Number.parseInt(part, 10) || 0);
  const right = normalizeVersion(b).split('.').map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
};

export const checkForAppUpdate = async (): Promise<AppUpdateInfo> => {
  const appInfo = await App.getInfo();
  const response = await fetch(RELEASE_API_URL, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`获取更新信息失败: ${response.status}`);
  }

  const release = (await response.json()) as GitHubRelease;
  const asset = release.assets.find((item) => /^wahaha-release-.*\.apk$/i.test(item.name));

  if (!asset) {
    throw new Error('最新发布中未找到 APK 安装包');
  }

  const currentVersion = normalizeVersion(appInfo.version || '0.0.0');
  const latestVersion = normalizeVersion(release.tag_name || release.name || '0.0.0');

  return {
    currentVersion,
    latestVersion,
    assetName: asset.name,
    assetUrl: asset.browser_download_url,
    releaseNotes: release.body || '',
    hasUpdate: compareVersions(latestVersion, currentVersion) > 0,
  };
};

export const installLatestApk = async (apkUrl: string, fileName: string) => {
  if (!Capacitor.isNativePlatform()) {
    window.open(apkUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  await AndroidUpdater.installApk({ apkUrl, fileName });
};
