import urllib.request
import zipfile
import os
import io
import winreg

def install_ffmpeg():
    print("Downloading FFmpeg from gyan.dev...")
    url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
    
    # Download zip file in memory
    response = urllib.request.urlopen(url)
    zip_content = response.read()
    print("Downloaded successfully. Extracting...")
    
    # Extract to C:\ffmpeg
    install_dir = r"C:\ffmpeg"
    if not os.path.exists(install_dir):
        os.makedirs(install_dir)
        
    with zipfile.ZipFile(io.BytesIO(zip_content)) as z:
        # It has a root folder like ffmpeg-7.0.1-essentials_build, we want to extract its contents
        for file_info in z.infolist():
            # Strip the first directory path
            parts = file_info.filename.split('/')
            if len(parts) > 1:
                # new path
                new_path = os.path.join(install_dir, *parts[1:])
                if file_info.is_dir():
                    os.makedirs(new_path, exist_ok=True)
                else:
                    os.makedirs(os.path.dirname(new_path), exist_ok=True)
                    with open(new_path, 'wb') as f_out:
                         f_out.write(z.read(file_info.filename))
            elif not file_info.is_dir():
                pass # root files, ignore or extract

    print("Extracted to C:\\ffmpeg.")
    
    bin_path = r"C:\ffmpeg\bin"
    
    # Add to User PATH
    print(f"Adding {bin_path} to User PATH...")
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment", 0, winreg.KEY_ALL_ACCESS)
        try:
            current_path, _ = winreg.QueryValueEx(key, "PATH")
        except FileNotFoundError:
            current_path = ""
            
        if bin_path not in current_path:
            new_path = current_path + ";" + bin_path if current_path else bin_path
            new_path = new_path.replace(";;", ";")
            winreg.SetValueEx(key, "PATH", 0, winreg.REG_SZ, new_path)
            # Notify system of environment change
            import ctypes
            HWND_BROADCAST = 0xFFFF
            WM_SETTINGCHANGE = 0x001A
            SMTO_ABORTIFHUNG = 0x0002
            result = ctypes.c_long()
            ctypes.windll.user32.SendMessageTimeoutW(HWND_BROADCAST, WM_SETTINGCHANGE, 0, "Environment", SMTO_ABORTIFHUNG, 5000, ctypes.byref(result))
            print("Successfully added to User PATH.")
        else:
            print("FFmpeg bin is already in User PATH.")
            
        winreg.CloseKey(key)
    except Exception as e:
        print(f"Failed to update PATH: {e}")

if __name__ == '__main__':
    install_ffmpeg()
