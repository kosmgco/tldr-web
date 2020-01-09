<template>
    <div id="app">
        <el-container>
            <el-header style="padding-bottom: 10px;" :height="10">
                <el-row>
                    <label style="font-weight: bold; font-size: 44px;" class="brand"><a href="/">tldr</a></label>
                    <label style="font-size: 18px;"> Simplified and community-driven man pages <a
                            href="https://tldr.sh">https://tldr.sh</a></label>
                </el-row>
            </el-header>
            <el-main>
                <el-row :gutter="20">
                    <el-col :span="12" class="platform">
                        <label style="font-size: 20px;">platform: </label>
                        <el-select v-model="platform" placeholder="请选择平台" size="small" style="width: 80%;"
                                   @change="onPlatformChange">
                            <el-option
                                    size="small"
                                    v-for="item in platforms"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                            ></el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="12">
                        <label style="font-size: 20px;">language:</label>
                        <el-select v-model="language" placeholder="请选择语言" size="small" style="width: 80%"
                                   @change="onLanguageChange">
                            <el-option
                                    v-for="item in languages"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                            ></el-option>
                        </el-select>
                    </el-col>
                </el-row>
                <br/>
                <el-row :gutter="20">
                    <el-col :span="24">
                        <label style="font-size: 20px;">command:</label>
                        <el-autocomplete
                                clearable
                                style="width:90%"
                                size="small"
                                v-model="state"
                                :fetch-suggestions="querySearchAsync"
                                placeholder="请输入内容"
                                @select="handleSelect"
                        >
                            <template slot-scope="{ item }">
                                <span style="margin-right: 10px;">{{ item.value }} </span>
                                <el-tag size="mini" effect="plain">{{ item.platform }}</el-tag>
                                <el-tag size="mini" effect="plain">{{ item.language }}</el-tag>
                            </template>
                        </el-autocomplete>
                    </el-col>
                </el-row>
                <br/>
                <el-row>
                    <el-col :span="24">
                        <div class="tag-group">
                            <el-tag v-for="item in hotTags" :key="item.name" @click="clickTag(item)" disable-transitions
                                    size="medium" effect="plain" type="info">
                                {{ item.name }}
                            </el-tag>
                        </div>
                    </el-col>
                </el-row>
                <br/>
                <el-row>
                    <el-col :span="24">
                        <div class="content" v-on:click="clickContent">
                            <vue-showdown :markdown="markdownSource" class="markdown-body"></vue-showdown>
                        </div>
                    </el-col>
                </el-row>
                <br/>

            </el-main>
            <el-footer>
                Powered By
                <el-link href="//golang.org" target="_blank"><i class="el-icon-link"></i>Golang</el-link>
                |
                <el-link href="//vuejs.org" target="_blank"><i class="el-icon-link"></i>Vue.js</el-link>
                |
                <el-link href="//element.eleme.cn" target="_blank"><i class="el-icon-link"></i>ElementUI</el-link>
                <br/>
                &copy; 2020 - <i class="el-icon-user"></i> ooops
            </el-footer>
        </el-container>
    </div>
</template>

<script>
  import axios from 'axios'
  import Base64 from 'js-base64'

  const service = axios.create({
    baseURL: "https://tldr-web.ooops.me", // api的base_url
    timeout: 5000, // 请求超时时间
    withCredentials: true
  });

  export default {
    name: 'app',
    data() {
      return {
        state: '',
        timeout: null,
        platforms: [],
        platform: '',
        languages: [],
        language: '',
        markdownSource: '![](./img/screenshot.png)',
        hotTags: [],
      };
    },
    methods: {
      querySearchAsync(queryString, cb) {
        let url = '/tldr/search?query=' + queryString;
        url += this.platform.trim() === "" ? "" : "&platform=" + this.platform.trim();
        url += this.language.trim() === "" ? "" : "&lang=" + this.language.trim();
        let that = this;
        service.get(url).then(function (resp) {
          let results = [];
          resp.data.data.forEach(function (item) {
            item.targets.forEach(function (target) {
              if (that.platform !== "" && that.platform !== target.os) {
                return
              }
              if (that.language !== "" && that.language !== target.language) {
                return
              }
              results.push({
                'value': item.name,
                'platform': target.os,
                'language': target.language,
              });
            });
          });
          cb(results);
        });
      },
      clickContent(e) {
        if (e.target.nodeName === "CODE") {
          this.$copyText(e.target.innerText, e.target);
          this.$message({
            message: '已经复制到剪贴板',
            type: 'success',
            center: true
          });
        }
      },
      clickTag(args) {
        this.platform = args.platform;
        this.state = args.name;
        this.language = args.language;
        this.handleSelect({
          'value': args.name,
          'platform': args.platform,
          'language': args.language,
        });
      },
      handleSelect(item) {
        let that = this;
        service.get('/tldr/get?name=' + item.value + '&platform=' + item.platform + '&language=' + item.language).then(function (resp) {
          that.markdownSource = Base64.Base64.decode(resp.data.content);
        });
        window.location.href = window.location.protocol + '//' + window.location.host + '#' + (item.platform === "" ? "" : item.platform + ".") + (item.language === "" ? "" : item.language + ".") + item.value
      },
      onPlatformChange(args) {
        this.getConf(args, '');
        localStorage.setItem('TLDR_PLATFORM', args)
      },
      onLanguageChange(args) {
        this.getConf('', args);
        localStorage.setItem('TLDR_LANGUAGE', args)
      },
      getHot() {
        let that = this;
        service.get('/tldr/hot').then(function (resp) {
          let tags = [];
          resp.data.data.forEach(function (item) {
            tags.push(item)
          });
          that.hotTags = tags;
        });
      },
      getConf(platform, language) {
        let url = "/tldr/conf";
        if (platform.trim() !== "") {
          url += "?platform=" + platform.trim();
        } else if (language.trim() !== "") {
          url += "?language=" + language.trim();
        }

        let that = this;
        service.get(url).then(function (resp) {
          let platforms = [];
          platforms.push({
            'value': '',
            'label': '不限/all'
          });
          resp.data.platforms.forEach(function (item) {
            platforms.push({
              'value': item,
              'label': item
            });
          });
          that.platforms = platforms;
          let languages = [];
          languages.push({
            'value': '',
            'label': '不限/all'
          });
          resp.data.languages.forEach(function (item) {
            languages.push({
              'value': item,
              'label': item
            });
          });
          that.languages = languages;
        })
      },
      init() {
        this.getConf('', '');
        this.getHot();
        this.platform = localStorage.getItem('TLDR_PLATFORM') ? localStorage.getItem('TLDR_PLATFORM') : '';
        this.language = localStorage.getItem('TLDR_LANGUAGE') ? localStorage.getItem('TLDR_LANGUAGE') : '';
        let hashes = window.location.hash.replace('#', '').split('.');
        if (hashes.length > 2) {
          this.state = hashes[2];
          this.platform = hashes[0];
          this.language = hashes[1];
          this.handleSelect({
            value: this.state,
            platform: this.platform,
            language: this.language
          })
        }
      }
    },
    mounted() {
      this.init()
    }
  }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        width: 70%;
        margin: 0 auto;
    }

    code {
        color: RGB(158, 67, 68);
    }

    .el-row .brand a {
        text-decoration: none;
        color: black;
    }

    .el-tag {
        margin-right: 10px;
    }

    .el-main {
        min-height: 800px;
    }

    .el-footer {
        min-height: 100%;
    }

    .el-header {
        border-bottom: 1px solid #eee;
        overflow: visible;
    }

    @media screen and (max-width: 1000px) {
        #app {
            width: 100%;
        }

        .el-header {
        }

    }

    @media screen and (max-width: 600px) {
        #app {
            width: 100%;
        }

        .el-header {
            height: 100px;
        }
    }

    @media screen and (max-width: 1024px) {
        #app {
            width: 100%;
        }
    }

</style>
