app.factory("pimg",function () {
    function pick_img(type) {
        switch (type){
            case "本地固定磁盘":return "img/disk.png";
            case "光盘":return "img/disc.png";
            case "文件夹":return "img/folder.png";
            case ".exe文件":return "img/exe.jpg";
            case ".avi文件":return "img/avi.png";
            case ".bat文件":return "img/bat.png";
            case ".bmp文件":return "img/bmp.png";
            case ".dll文件":return "img/dll.png";
            case ".doc文件":return "img/doc.png";
            case ".docx文件":return "img/docx.png";
            case ".gif文件":return "img/gif.png";
            case ".html文件":return "img/html.png";
            case ".ico文件":return "img/ico.png";
            case ".ini文件":return "img/ini.png";
            case ".jar文件":return "img/java.png";
            case ".java文件":return "img/java.png";
            case ".jpg文件":return "img/jpg.png";
            case ".jpeg文件":return "img/jpg.png";
            case ".log文件":return "img/log.png";
            case ".mov文件":return "img/mov.png";
            case ".mp3文件":return "img/mp3.png";
            case ".mp4文件":return "img/mp4.png";
            case ".mpeg文件":return "img/mpeg.png";
            case ".pdf文件":return "img/pdf.png";
            case ".png文件":return "img/png.png";
            case ".ppt文件":return "img/ppt.png";
            case ".pptx文件":return "img/pptx.png";
            case ".psd文件":return "img/psd.png";
            case ".rar文件":return "img/rar.png";
            case ".txt文件":return "img/txt.png";
            case ".wav文件":return "img/wav.png";
            case ".xls文件":return "img/xls.png";
            case ".xlsx文件":return "img/xlsx.png";
            case ".xml文件":return "img/xml.png";
            case ".zip文件":return "img/zip.png";
            case ".7z文件":return "img/zip.png";
            default:return "img/unknown.png";
        }
    }
    return{
        pick_img:pick_img
    }
})
