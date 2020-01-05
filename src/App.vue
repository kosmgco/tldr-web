<template>
    <div id="app">
        <el-container>
            <el-header>
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
                        ></el-autocomplete>
                    </el-col>
                </el-row>
                <br/>
                <vue-showdown :markdown="markdownSource" class="markdown-body"></vue-showdown>
            </el-main>
        </el-container>
    </div>
</template>

<script>
  import axios from 'axios'
  import Base64 from 'js-base64'

  export default {
    name: 'app',
    data() {
      return {
        state: '',
        timeout: null,
        platforms: [],
        platform: 'common',
        languages: [],
        language: 'en',
        markdownSource: '![](./img/screenshot.afb42628.png)',
      };
    },
    methods: {
      querySearchAsync(queryString, cb) {
        let url = '//tldr-web.ooops.me/tldr/search?query=' + queryString;
        if (this.platform.trim() !== "") {
          url += "&platform=" + this.platform.trim();
        }
        if (this.language.trim() !== "") {
          url += "&lang=" + this.language.trim();
        }
        let that = this;
        axios.get(url).then(function (resp) {
          let results = [];
          resp.data.data.forEach(function (item) {
            results.push({
              'value': item.name,
              'platform': that.platform,
              'language': that.language
            });
          });
          cb(results);
        })
      },
      handleSelect(item) {
        let that = this;
        axios.get('//tldr-web.ooops.me/tldr/get?name=' + item.value + '&platform=' + item.platform + '&language=' + item.language).then(function (resp) {
          that.markdownSource = Base64.Base64.decode(resp.data.content);
          that.imgDisplay = 'none';
        });
      },
      onPlatformChange(args) {
        this.getConf(args, '');
        localStorage.setItem('TLDR_PLATFORM', args)
      },
      onLanguageChange(args) {
        this.getConf('', args);
        localStorage.setItem('TLDR_LANGUAGE', args)
      },
      getConf(platform, language) {
        let url = "//tldr-web.ooops.me/tldr/conf";
        if (platform.trim() !== "") {
          url += "?platform=" + platform.trim();
        } else if (language.trim() !== "") {
          url += "?language=" + language.trim();
        }

        let that = this;
        axios.get(url).then(function (resp) {
          let platforms = [];
          resp.data.platforms.forEach(function (item) {
            platforms.push({
              'value': item,
              'label': item
            });
          });
          that.platforms = platforms
          let languages = [];
          resp.data.languages.forEach(function (item) {
            languages.push({
              'value': item,
              'label': item
            });
          });
          that.languages = languages;
        })
      }
    },
    mounted() {
      this.getConf('', '');
      this.platform = localStorage.getItem('TLDR_PLATFORM') ? localStorage.getItem('TLDR_PLATFORM') : 'common';
      this.language = localStorage.getItem('TLDR_LANGUAGE') ? localStorage.getItem('TLDR_LANGUAGE') : 'en';
    }
  }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        width: 1000px;
        margin: 0 auto;
    }

    code {
        color: RGB(158, 67, 68);
    }

    .el-row .brand a {
        text-decoration: none;
        color: black;
    }

</style>
