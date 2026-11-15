package com.survival.app;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.database.Cursor;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import androidx.core.content.FileProvider;
import java.io.File;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.webkit.WebViewAssetLoader;

/** Wraps the offline Survival App page. The page is served from a stable https origin
 *  so saved pins, checklists and offline map areas persist between launches. */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private WebView web;
    private GeolocationPermissions.Callback geoCallback;
    private String geoOrigin;
    private File pendingApk;
    private static final String RELEASES = "https://github.com/mrsirwithpizza101/Survival-App/releases/download/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#14130f"));
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .setDomain(HOST)
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#14130f"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setGeolocationEnabled(true);
        s.setAllowFileAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportMultipleWindows(false);

        web.addJavascriptInterface(new Bridge(), "AndroidApp");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                return loader.shouldInterceptRequest(r.getUrl());
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (HOST.equals(u.getHost())) return false;
                // Street View, map apps and other outside links open in the phone's own apps.
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback cb) {
                if (hasLocation()) { cb.invoke(origin, true, false); return; }
                geoOrigin = origin; geoCallback = cb;
                if (Build.VERSION.SDK_INT >= 23) requestPermissions(new String[]{
                        Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, 7);
            }
        });
        // After an update, drop any cached copy of the old page so new features show up.
        try {
            int ver = getPackageManager().getPackageInfo(getPackageName(), 0).versionCode;
            android.content.SharedPreferences prefs = getSharedPreferences("app", MODE_PRIVATE);
            if (prefs.getInt("ver", -1) != ver) { web.clearCache(true); prefs.edit().putInt("ver", ver).apply(); }
        } catch (Exception ignored) {}
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        setContentView(web);
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("https://" + HOST + "/assets/index.html");
    }

    private boolean hasLocation() {
        return Build.VERSION.SDK_INT < 23 ||
                checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        if (geoCallback != null) { geoCallback.invoke(geoOrigin, hasLocation(), false); geoCallback = null; }
    }

    /** Lets the page check its version and install updates published on GitHub Releases. */
    class Bridge {
        @JavascriptInterface public String version() {
            try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception e) { return ""; }
        }
        @JavascriptInterface public void installUpdate(String url) {
            if (url == null || !url.startsWith(RELEASES) || !url.endsWith(".apk")) return; // only this app's own releases
            runOnUiThread(() -> download(url));
        }
    }

    private void js(String code) { runOnUiThread(() -> web.evaluateJavascript(code, null)); }

    private void download(String url) {
        try {
            File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            File f = new File(dir, "Survival-App-update.apk");
            if (f.exists()) f.delete();
            DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
            DownloadManager.Request rq = new DownloadManager.Request(Uri.parse(url))
                    .setTitle("Survival App update")
                    .setMimeType("application/vnd.android.package-archive")
                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE)
                    .setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, "Survival-App-update.apk");
            final long id = dm.enqueue(rq);
            final Handler h = new Handler(Looper.getMainLooper());
            h.post(new Runnable() {
                @Override public void run() {
                    Cursor c = dm.query(new DownloadManager.Query().setFilterById(id));
                    if (c == null || !c.moveToFirst()) { if (c != null) c.close(); js("window.__updMsg&&__updMsg('Download stopped. Try again.')"); return; }
                    int st = c.getInt(c.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
                    long done = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
                    long total = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
                    c.close();
                    if (st == DownloadManager.STATUS_SUCCESSFUL) { js("window.__updProgress&&__updProgress(100)"); install(f); return; }
                    if (st == DownloadManager.STATUS_FAILED) { js("window.__updMsg&&__updMsg('Download failed. Check your signal and try again.')"); return; }
                    if (total > 0) js("window.__updProgress&&__updProgress(" + (done * 100 / total) + ")");
                    h.postDelayed(this, 600);
                }
            });
        } catch (Exception e) {
            js("window.__updMsg&&__updMsg('Could not start the download.')");
        }
    }

    private void install(File f) {
        if (Build.VERSION.SDK_INT >= 26 && !getPackageManager().canRequestPackageInstalls()) {
            pendingApk = f;
            js("window.__updMsg&&__updMsg('Allow Survival App to install updates, then come back. It continues by itself.')");
            try { startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName()))); } catch (Exception ignored) {}
            return;
        }
        pendingApk = null;
        try {
            Uri u = FileProvider.getUriForFile(this, getPackageName() + ".files", f);
            Intent i = new Intent(Intent.ACTION_VIEW).setDataAndType(u, "application/vnd.android.package-archive")
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) {
            js("window.__updMsg&&__updMsg('Could not open the installer.')");
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (pendingApk != null && (Build.VERSION.SDK_INT < 26 || getPackageManager().canRequestPackageInstalls())) install(pendingApk);
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

    @Override
    public void onBackPressed() {
        // Let the page close an open app screen first; exit only from the home screen.
        web.evaluateJavascript("(window.__back && window.__back()) ? '1' : '0'", value -> {
            if (!"\"1\"".equals(value)) finish();
        });
    }
}
