package com.goprohero10.nativecamera; // replace your-apps-package-name with your app’s package name
import android.content.Context;
import android.content.Intent;
import android.provider.MediaStore;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;

public class CameraModule extends ReactContextBaseJavaModule {

    Context context;

    CameraModule(ReactApplicationContext context) {
        super(context);
        this.context = context.getApplicationContext();
    }
    @Override
    public String getName() {
        return "CameraModule";
    }

    @ReactMethod
    public void openCamera() {
        Intent intent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        context.startActivity(intent);
    }
}