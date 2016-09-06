# feather2lothar

此工具用来将feather1.x的项目尝试转换为lothar

### 具体用法

```sh
feather2lothar feather-demo ./lothar-demo
```

执行后，会产出一个common模块，如果原feather项目的目录结构不规范，则会将其他文件直接放置于main模块中

```sh
├── common  ##common模块
│   ├── components
│   │   ├── ui
│   │   │   └── zepto
│   │   │       └── zepto.js
│   │   └── vue
│   │       └── vue.js
│   ├── conf
│   │   ├── conf.js
│   │   └── deploy
│   │       └── build.js
│   ├── data
│   │   └── widget
│   │       └── header
│   │           └── header.php
│   ├── static
│   │   ├── common.css
│   │   ├── common.js
│   │   ├── images
│   │   └── reset.css
│   └── widget
│       ├── footer
│       │   └── footer.html
│       ├── header
│       │   ├── header.css
│       │   └── header.html
│       └── title
│           ├── title.css
│           └── title.html
└── main    ##非common的都会放置main模块
    ├── conf
    │   ├── conf.js
    │   ├── deploy
    │   │   ├── build.js
    │   └── rewrite.js
    ├── data
    ├── static
    └── widget

```

### 使用lothar

```sh
lothar release -r lothar-demo/common
lothar release -r lothar-demo/main
```
