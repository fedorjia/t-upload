> t-upload是一个文件上传服务

> 支持图片上传、文件上传；dataurl转图片

# 创建app

上传者进行上传操作，前提是必须创建app。

参数：

`name: app名称`

curl：

```
curl -X POST -d 'name=assist' 'http://localhost:3001/private/app?token=57afdf28dc3137132ba6d997'
```
# 获取signature

上传者进行上传操作，必须先获取signature信息，然后上传。此请求应由后端发起。

参数：

```
appid: app id
secret: app secret
```

curl:

```
curl -X GET 'http://localhost:3001/sign?appid=59e6b71d5fbca4f8e605fef0&secret=d15255d753834757dafc4c7f4cc6c8d7eec5e58a8b354afc49b969d10dd86f14'
```

# examples

```
http://localhost:3001/test
```