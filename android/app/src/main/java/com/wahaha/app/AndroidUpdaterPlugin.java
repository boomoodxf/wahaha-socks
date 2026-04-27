package com.wahaha.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "AndroidUpdater")
public class AndroidUpdaterPlugin extends Plugin {

    @PluginMethod
    public void installApk(PluginCall call) {
        String apkUrl = call.getString("apkUrl");
        String fileName = call.getString("fileName", "wahaha-release.apk");

        if (apkUrl == null || apkUrl.isEmpty()) {
            call.reject("缺少 apkUrl");
            return;
        }

        bridge.execute(() -> {
            HttpURLConnection connection = null;
            InputStream inputStream = null;
            FileOutputStream outputStream = null;

            try {
                URL url = new URL(apkUrl);
                connection = (HttpURLConnection) url.openConnection();
                connection.setConnectTimeout(15000);
                connection.setReadTimeout(30000);
                connection.connect();

                if (connection.getResponseCode() < 200 || connection.getResponseCode() >= 300) {
                    call.reject("下载 APK 失败: " + connection.getResponseCode());
                    return;
                }

                File apkFile = new File(getContext().getCacheDir(), fileName);
                inputStream = connection.getInputStream();
                outputStream = new FileOutputStream(apkFile, false);

                byte[] buffer = new byte[8192];
                int length;
                while ((length = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, length);
                }
                outputStream.flush();

                Uri apkUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    apkFile
                );

                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                try {
                    getContext().startActivity(intent);
                } catch (ActivityNotFoundException exception) {
                    call.reject("系统无法打开安装器", exception);
                    return;
                }

                JSObject result = new JSObject();
                result.put("fileName", fileName);
                call.resolve(result);
            } catch (Exception exception) {
                call.reject("安装更新失败", exception);
            } finally {
                try {
                    if (inputStream != null) inputStream.close();
                } catch (Exception ignored) {
                }
                try {
                    if (outputStream != null) outputStream.close();
                } catch (Exception ignored) {
                }
                if (connection != null) {
                    connection.disconnect();
                }
            }
        });
    }
}
