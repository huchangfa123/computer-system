var app = angular.module('mycomputer', ['ui.router','ngAnimate']);
var _electron = require('electron');
var child_process = require('child_process');
var wmic = require('node-wmic');
var path = require('path');
var iconv = require('iconv-lite');

app.controller('cpu_message', function($scope,$interval) {
    var os=require('os');
    $scope.cpu_arch=os.arch();
    $interval(function () {
        $scope.cpu_free_mem=os.freemem();
    },1000);
    $scope.cpu_total_mem=os.totalmem();
    $scope.host_name=os.hostname();
    $scope.os_version=os.release();
    $interval(function () {
        $scope.os_up_time=os.uptime();

    },1000);
});

app.controller('file_ctrl',function ($scope,$q,pimg) {

    var fs = require('fs');
    var files;
    $scope.pathstore = new Array();
    $scope.npos = -1;
    $scope.alldisks =[];
    var first_path='Computer';
    $scope.path = first_path;
    $scope.key="";
    $scope.searching = false;
    var counter=0;
    const remote=_electron.remote;
    const Menu = _electron.remote.Menu;
    const MenuItem =_electron.remote.MenuItem;
    var menu=new Menu();
    var rightClickPosition = null;


    $scope.getDisk=function () {
        return wmic.disk().then(disks => {
            $scope.alldisks=disks; //把光盘信息保存到￥scope.alldisks中
            console.log($scope.alldisks.length);//输出￥scope.alldisks的长度
    }, err => {
            console.log(err);
        })
    }//用于获取光盘信息函数

    $scope.toComputer=function () {
        $scope.save_array=[];  //保存数据的数组
        console.log($scope.alldisks.length);//判断￥scope.alldisks的长度
        for(var i=0;i<$scope.alldisks.length;i++)//把alldisks的数据转到保存数据的数组
        {
            $scope.save_array.push({
                filename:$scope.alldisks[i].Caption,
                index:i,
                type:$scope.alldisks[i].Description,
                judge:'disk',
                select:false,
                img:pimg.pick_img($scope.alldisks[i].Description)
            });
        }
    }

    function read_message() {//读出当前目录
        var counter=0;//id计数器
        $scope.save_array=[];//清空旧目录
        if($scope.path=='Computer')//第一个目录特殊情况
        {
            $scope.toComputer();
        }
        else
        {
            files = fs.readdirSync($scope.path);//nodejs读取目录的函数
                for(var i=0;i<files.length;i++)
                {
                    try
                    {
                        var stat = fs.lstatSync($scope.path + '/' + files[i]);
                        var t = stat.mtime;
                        var c = stat.birthtime;
                        var ext;
                        if(stat.isDirectory()) ext = "文件夹";
                        else ext = path.extname($scope.path + '/' + files[i])+"文件";
                        $scope.save_array.push({//赋值给用于保存数据的数组
                            filename: files[i],
                            index: counter,
                            birthtime: c.getFullYear() + '/' + (c.getMonth() + 1) + '/' + c.getDate() + ' ' + c.getHours() + ':' + c.getMinutes() + ':' + c.getSeconds(),
                            time: t.getFullYear() + '/' + (t.getMonth() + 1) + '/' + t.getDate() + ' ' + t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds(),
                            judge: 'file',
                            size: stat.size,
                            rename: false,
                            select:false,
                            cut:false,
                            type:ext,
                            img:pimg.pick_img(ext)
                        });
                        counter += 1;
                    }
                    catch (e)
                    {
                        //console.log(files[i]);
                        //$scope.save_array.pop();
                        //console.log($scope.save_array[i-1]);
                        continue;
                    }
                }
               // console.log(i);
               // console.log($scope.save_array[i-1]);
        }
    }

    $scope.change_path = function(file) {
        if(file.type=='光盘')
        {
            alert('请装入光盘!');
        }
        else
        {
            $scope.save_array = [];
            $scope.path = [];
            //console.log($scope.path);
            $scope.npos += 1;
            $scope.pathstore.splice($scope.npos, $scope.pathstore.length - $scope.npos);
            $scope.pathstore.push(file);
            for (var i = 0; i < $scope.pathstore.length; i++) {
                if ($scope.pathstore[i].judge == 'file')
                    $scope.path = $scope.path + '/' + $scope.pathstore[i].filename;
                else
                    $scope.path = $scope.pathstore[i].filename;
            }
            //console.log($scope.path);
            var stat = fs.lstatSync($scope.path);
            if (stat.isFile()) {
                child_process.exec($scope.path);
                $scope.path = [];
                $scope.pathstore.pop();
                $scope.npos -= 1;
                if ($scope.npos == -1) {
                    $scope.path = 'Computer';
                    $scope.getdisk();
                }
                else {
                    for (var i = 0; i < $scope.pathstore.length; i++) {
                        if ($scope.pathstore[i].judge == 'file')
                            $scope.path = $scope.path + '/' + $scope.pathstore[i].filename;
                        else
                            $scope.path = $scope.pathstore[i].filename;
                    }
                    read_message();
                }
            }
            else
                read_message();
        }
    };

    $scope.go_back=function () {
        $scope.save_array=[];
        $scope.path=[];
        $scope.npos-=1;
        if($scope.npos<=-1)
            $scope.path = first_path;
        else
        {
            for(var i = 0 ; i <= $scope.npos ; i++ )
            {
                if($scope.pathstore[i]=='Computer')
                {
                    $scope.path='Computer';
                    break;
                }
                else
                {
                    if($scope.pathstore[i].judge=='file')
                        $scope.path = $scope.path + '/' +  $scope.pathstore[i].filename;
                    else
                        $scope.path= $scope.pathstore[i].filename;
                }
            }
        }
        read_message();
    };

    $scope.go_ahead=function () {
        $scope.save_array=[];
        $scope.path=first_path;
        $scope.npos+=1;
        for(var i = 0 ; i <= $scope.npos ; i++ )
        {
            if($scope.pathstore[i]=='Computer')
            {
                $scope.path='Computer';
                break;
            }
            else
            {
                if($scope.pathstore[i].judge=='file')
                    $scope.path = $scope.path + '/' +  $scope.pathstore[i].filename;
                else
                    $scope.path= $scope.pathstore[i].filename;
            }
        }
        read_message();
    };

    $scope.home=function () {
        $scope.save_array=[];
        $scope.npos += 1;
        $scope.pathstore.splice($scope.npos, $scope.pathstore.length-$scope.npos);
        var newpaths = first_path;
        $scope.pathstore.push(newpaths);
        $scope.path = first_path;
        read_message();
    };

     function readDetail(path) {
        var deferred = $q.defer();
        var promise = deferred.promise;
        fs.stat(path, function (err,stats) {
            if(err)deferred.reject(err);
            else {
                deferred.resolve([stats,path]);
            }
        });
        return promise;
     }

    $scope.climb=function (climb_path) {
        if(climb_path.includes("undefined")) return;
        var cfile = fs.readdirSync(climb_path);
        var promises = [];
        for (var i = 0; i < cfile.length; i++) {
            if(cfile[i]!="undefined")
            {
                promises.push(readDetail(climb_path + '/' + cfile[i]).then(function (result) {
                    //console.log(result[1]);
                     if (path.basename(result[1]).toLowerCase().includes($scope.key.toLowerCase())) {
                     var t = result[0].mtime;
                     var c = result[0].birthtime;
                     var ext;
                     if (result[0].isDirectory()) ext = "文件夹";
                     else ext = path.extname(result[1]) + "文件";
                     $scope.save_array.push({//赋值给用于保存数据的数组
                     filename: path.basename(result[1]),
                     path:result[1],
                     index: counter,
                     birthtime: c.getFullYear() + '/' + (c.getMonth() + 1) + '/' + c.getDate() + ' ' + c.getHours() + ':' + c.getMinutes() + ':' + c.getSeconds(),
                     time: t.getFullYear() + '/' + (t.getMonth() + 1) + '/' + t.getDate() + ' ' + t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds(),
                     judge: 'file',
                     size: result[0].size,
                     rename: false,
                     select: false,
                     cut:false,
                     type: ext,
                     img: pimg.pick_img(ext)
                     });
                     counter += 1;
                     }
                     if (result[0].isDirectory()) {
                         //console.log(result[1]);
                         $scope.climb(result[1]);
                     }
                }));
            }
        }
        Promise.all(promises).then(() => {
            $scope.searching = false;
        }).catch(err => {
            console.log(err);
        });
        //console.log($scope.save_array);
        }

    $scope.search=function(){
        if($scope.path=='Computer')
        {
            alert('因技术问题全电脑搜索速度慢，有点卡，' +'\n'+
                '因此不开放该功能，只提供盘内搜索，请原谅！');
        }
        else {
            if ($scope.key != "") {
                $scope.save_array = [];
                counter = 0;
                $scope.searching = true;
                $scope.climb($scope.path);
            }
        }

    }

    $scope.get_select=function (index) {
        $scope.save_array[index].select = true;
        for(var i=0;i<$scope.save_array.length;i++)
        {
            if(i!=index)
                $scope.save_array[i].select=false;
        }
    };
    
    $scope.delete=function (path) {
        var stat=fs.lstatSync(path);
        if(stat.isFile())
        {
            fs.unlinkSync(path);
        }
        else
        {
            child_process.exec('rmdir "'+ path +'" /S /Q',{encoding: 'GB2312'},err => {
                //debugger;
                if(err) {
                    console.log('rmdir "'+ path +'" /S /Q');
                    //err = iconv.decode(err, 'GB2312');
                    console.log(err);
                }
                read_message();
            });
        }
    }
    
    $scope._rename=function (index) {
        $scope.save_array[index].rename = false;
        console.log($scope.path +'/'+ $scope.save_array[index].filename);
        fs.renameSync($scope.oldpath, $scope.path +'/'+ $scope.save_array[index].filename);
    }

    $scope.cutandcopy_savepath = null;
    $scope.cutting = false;
    $scope.oldpath =null;

    $scope.paste=function (src,dst,delete_src) {
        var stat=fs.lstatSync(src);
        let promises=[];
        var dist= dst + '/' + path.basename(src);
        promises.push(new Promise((resolve,reject) => {
                if(stat.isFile())
                {
                    if(fs.existsSync(dist))
                    {
                        if(confirm(path.basename(dist) + "已存在，是否替换?"))
                        {
                            fs.unlinkSync(dist);
                            fs.createReadStream(src).pipe(fs.createWriteStream(dist));
                        }
                    }
                    else
                    {
                        fs.createReadStream(src).pipe(fs.createWriteStream(dist));
                    }
                }
                else
                {
                    if(!fs.existsSync(dist))
                        child_process.exec('xcopy "'+ src + '" "' + dist +'" /E /C /Y /H /I');
                    else
                    {
                        if(confirm(path.basename(dist) + "已存在，是否替换?"))
                            child_process.exec('xcopy "'+ src + '" "' + dist +'" /E /C /Y /H /I');
                    }
                }
                resolve();
        }));
        Promise.all(promises).then(() => {

            if($scope.cutting) {
                $scope.delete(delete_src);
            }

        }).then(()=>{

            if(!fs.existsSync(delete_src))
            $scope.cutting = false;

            if($scope.cutting)
            {
                if(fs.existsSync(delete_src))
                $scope.delete(delete_src);
                $scope.cutting = false;
            }

        }).then(()=>{
          read_message();
        }).catch(err => {
            console.log(err);
        });
    }

    menu.append(new MenuItem(
    {
        label:'新建文件夹',
        click:function () {
            for(var i=1;;i++)
            {
                if (!fs.existsSync($scope.path+'/新建文件夹'))
                {
                    fs.mkdirSync($scope.path+'/新建文件夹', 0777);
                    break;
                }
                else
                {
                    if(!fs.existsSync($scope.path+'/新建文件夹('+i+')'))
                    {
                        fs.mkdirSync($scope.path+'/新建文件夹('+i+')', 0777);
                        break;
                    }
                    else continue;
                }
            }
            read_message();
        }
    }));

    menu.append(new MenuItem(
        {
            label:'重命名',
            click:function(){
                var selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode.parentNode;
                var id = selectedElement.attributes.id.nodeValue;
                $scope.save_array[id].rename=true;
                $scope.oldpath=$scope.path+'/'+ $scope.save_array[id].filename;
            }
        }));

    menu.append(new MenuItem(
        {
            label: '剪切',
            click: function () {
                var selectedelement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode.parentNode;
                var id = selectedelement.attributes.id.nodeValue;
                $scope.cutandcopy_savepath = $scope.path + '/' + $scope.save_array[id].filename;
                $scope.save_array[id].cut=true;
                $scope.cutting = true;
                //console.log($scope.save_array[id].cut);
            }
        }));

    menu.append(new MenuItem(
        {
            label:'复制',
            click: function(){
                var selectedelement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode.parentNode;
                var id = selectedelement.attributes.id.nodeValue;
                //console.log(id);
                $scope.cutandcopy_savepath = $scope.path + '/' + $scope.save_array[id].filename;
                $scope.cutting = false;
            }
        }));

    menu.append(new MenuItem(
        {
            label:'粘贴',
            click: function () {
                var src = $scope.cutandcopy_savepath;
                var delete_src = src;
                var dst = $scope.path;

                if(src==(dst+'/'+path.basename(src)))
                {
                    alert('不能在相同路径中粘贴！');
                }
                else
                {
                    $scope.paste(src,dst,delete_src);
                    read_message();
                    alert('粘贴完成！');
                }
            }
        }));

    menu.append(new MenuItem(
        {
            label:'删除',
            click:function () {
                var selectedelement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode.parentNode;
                var id = selectedelement.attributes.id.nodeValue;
                var delete_path= $scope.path + '/' + $scope.save_array[id].filename;
                if(confirm("确定删除"+$scope.save_array[id].filename+"吗？"))
                {
                    $scope.delete(delete_path);
                    alert('完成删除');
                }

        }
        }));

    var FILE = document.getElementById("file");
    FILE.addEventListener('contextmenu',function (e) {
        e.preventDefault();
        rightClickPosition = {x:e.x,y:e.y};
        menu.items[0].enabled = true;
        menu.items[1].enabled = true;
        menu.items[2].enabled = true;
        menu.items[3].enabled = true;
        menu.items[4].enabled = true;
        menu.items[5].enabled = true;
        var selectedElement = document.elementFromPoint(rightClickPosition.x,rightClickPosition.y).parentNode;
        if($scope.path=='Computer'||$scope.searching)
        {
            menu.items[0].enabled = false;
            menu.items[1].enabled = false;
            menu.items[2].enabled = false;
            menu.items[3].enabled = false;
            menu.items[4].enabled = false;
            menu.items[5].enabled = false;
        }
        if($scope.cutandcopy_savepath==null)
        {
            menu.items[4].enabled = false;
        }
        menu.popup(remote.getCurrentWindow());
    });
    $scope.getDisk().then(()=>{
        read_message();
    });
});

app.config(function ($stateProvider,$urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('index', {
            url: '/',
            views: {
                'computer_message': {

                    templateUrl: 'computer_message.html',
                    controller: 'cpu_message'

                },
                'file': {
                    templateUrl: './file.html',
                    controller: 'file_ctrl'
                }
            }

        });
});